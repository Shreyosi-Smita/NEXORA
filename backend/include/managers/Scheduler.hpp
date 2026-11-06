#pragma once

#include "models/Task.hpp"
#include "dsa/MinHeap.hpp"
#include "dsa/DependencyManager.hpp"
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <string>
#include <chrono>
#include <algorithm>

namespace nexora {

class Scheduler {
public:
    explicit Scheduler(SchedulingMode defaultMode = SchedulingMode::DEADLINE_FIRST)
        : currentMode(defaultMode), heap(defaultMode) {}

    void setMode(SchedulingMode mode) {
        currentMode = mode;
        heap.setSchedulingMode(mode);
        rebuildHeap();
    }

    SchedulingMode getMode() const {
        return currentMode;
    }

    // Set tasks in repository and initialize eligible scheduling heap
    void initializeTasks(const std::unordered_map<std::string, Task>& allTasks) {
        taskStore = allTasks;
        completedTaskIds.clear();

        for (const auto& pair : taskStore) {
            if (pair.second.status == TaskStatus::COMPLETED) {
                completedTaskIds.insert(pair.first);
            }
        }

        rebuildHeap();
    }

    void addTask(const Task& task) {
        taskStore[task.id] = task;
        if (task.status == TaskStatus::COMPLETED) {
            completedTaskIds.insert(task.id);
            heap.removeById(task.id);
            return;
        }

        // Add task to heap if eligible
        if (isTaskEligible(task)) {
            Task evaluated = evaluateTask(task);
            heap.insert(evaluated);
        }
    }

    void updateTask(const Task& task) {
        taskStore[task.id] = task;
        if (task.status == TaskStatus::COMPLETED) {
            completedTaskIds.insert(task.id);
            heap.removeById(task.id);
            refreshEligibleTasks();
            return;
        }

        if (isTaskEligible(task)) {
            Task evaluated = evaluateTask(task);
            heap.insert(evaluated);
        } else {
            heap.removeById(task.id);
        }
    }

    void removeTask(const std::string& taskId) {
        taskStore.erase(taskId);
        completedTaskIds.erase(taskId);
        heap.removeById(taskId);
        dependencyManager.removeTask(taskId);
        refreshEligibleTasks();
    }

    void completeTask(const std::string& taskId) {
        auto it = taskStore.find(taskId);
        if (it != taskStore.end()) {
            it->second.status = TaskStatus::COMPLETED;
            it->second.completedAt = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now().time_since_epoch()).count();
            completedTaskIds.insert(taskId);
            heap.removeById(taskId);
            refreshEligibleTasks();
        }
    }

    // Dependency registration
    bool addDependency(const std::string& dependentTaskId, const std::string& prerequisiteTaskId) {
        bool success = dependencyManager.addDependency(dependentTaskId, prerequisiteTaskId);
        if (success) {
            rebuildHeap();
        }
        return success;
    }

    // Retrieves next recommended task — O(1)
    bool getNextTask(Task& outTask) {
        if (heap.isEmpty()) {
            return false;
        }
        outTask = heap.getMin();
        return true;
    }

    // Extract next task — O(log n)
    bool extractNextTask(Task& outTask) {
        if (heap.isEmpty()) {
            return false;
        }
        outTask = heap.extractMin();
        return true;
    }

    const std::unordered_map<std::string, Task>& getAllTasks() const {
        return taskStore;
    }

    bool hasTask(const std::string& taskId) const {
        return taskStore.find(taskId) != taskStore.end();
    }

    const Task* getTask(const std::string& taskId) const {
        auto it = taskStore.find(taskId);
        if (it != taskStore.end()) {
            return &(it->second);
        }
        return nullptr;
    }

    // Inspect underlying heap tree representation
    const std::vector<Task>& getHeapArray() const {
        return heap.getHeapArray();
    }

    size_t getQueueSize() const {
        return heap.size();
    }

    // Rebuild heap with all currently eligible pending tasks
    void rebuildHeap() {
        heap.clear();
        std::vector<Task> eligibleTasks;

        for (auto& pair : taskStore) {
            const Task& task = pair.second;
            if (task.status != TaskStatus::COMPLETED &&
                task.status != TaskStatus::CANCELLED &&
                !task.isArchived &&
                isTaskEligible(task)) {
                eligibleTasks.push_back(evaluateTask(task));
            }
        }

        heap.buildHeap(eligibleTasks);
    }

    // Smart algorithmic explanation generator
    std::string generateExplanation(const Task& task) const {
        int64_t nowMs = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
        int64_t diffHours = (task.deadline - nowMs) / 3600000LL;

        std::string priorityStr = (task.priority == Priority::HIGH ? "High" :
                                  (task.priority == Priority::MEDIUM ? "Medium" : "Low"));

        if (diffHours < 0) {
            return "Overdue task with " + priorityStr + " priority. Immediate attention required.";
        } else if (diffHours <= 24) {
            return "Due within 24 hours with " + priorityStr + " priority.";
        } else if (diffHours <= 72) {
            return "Approaching deadline (within 3 days) with " + priorityStr + " priority.";
        } else {
            return "Scheduled based on " + priorityStr + " priority and deadline order.";
        }
    }

private:
    SchedulingMode currentMode;
    MinHeap heap;
    DependencyManager dependencyManager;
    std::unordered_map<std::string, Task> taskStore;
    std::unordered_set<std::string> completedTaskIds;

    bool isTaskEligible(const Task& task) const {
        return dependencyManager.isTaskEligible(task.id, completedTaskIds);
    }

    void refreshEligibleTasks() {
        rebuildHeap();
    }

    Task evaluateTask(Task task) const {
        int64_t nowMs = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();

        double score = 0.0;
        // Priority scoring
        if (task.priority == Priority::HIGH) score += 30.0;
        else if (task.priority == Priority::MEDIUM) score += 20.0;
        else score += 10.0;

        // Deadline urgency scoring
        int64_t diffMs = task.deadline - nowMs;
        int64_t diffHours = diffMs / 3600000LL;

        if (diffHours < 0) {
            score += 50.0; // Overdue
        } else if (diffHours <= 24) {
            score += 40.0; // Due today
        } else if (diffHours <= 48) {
            score += 30.0; // Due tomorrow
        } else if (diffHours <= 72) {
            score += 20.0; // Due in 3 days
        } else if (diffHours <= 168) {
            score += 10.0; // Due in 7 days
        }

        task.calculatedUrgencyScore = score;
        task.schedulingReason = generateExplanation(task);
        return task;
    }
};

} // namespace nexora

