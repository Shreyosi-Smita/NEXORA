#pragma once

#include "models/Task.hpp"
#include "dsa/TaskComparator.hpp"
#include <vector>
#include <unordered_map>
#include <stdexcept>
#include <functional>
#include <iostream>

namespace nexora {

/**
 * Custom MinHeap implementation designed for task scheduling.
 * - Built on std::vector<Task> with zero-based indexing.
 * - Index relationships:
 *     Parent(i) = (i - 1) / 2
 *     LeftChild(i) = 2 * i + 1
 *     RightChild(i) = 2 * i + 2
 * - Time complexities:
 *     Insert: O(log n)
 *     getMin: O(1)
 *     extractMin: O(log n)
 *     buildHeap: O(n)
 *     Heap validation: O(n)
 *     Lookup by ID: O(1) average via internal position map
 */
class MinHeap {
public:
    explicit MinHeap(SchedulingMode mode = SchedulingMode::DEADLINE_FIRST)
        : comparator(mode) {}

    // Set scheduling mode and rebuild heap to satisfy new ordering invariant
    void setSchedulingMode(SchedulingMode mode) {
        comparator.setMode(mode);
        rebuildHeap();
    }

    SchedulingMode getSchedulingMode() const {
        return comparator.getMode();
    }

    size_t size() const {
        return heapArray.size();
    }

    bool isEmpty() const {
        return heapArray.empty();
    }

    void clear() {
        heapArray.clear();
        positionMap.clear();
    }

    // Insert task into heap — O(log n)
    void insert(const Task& task) {
        if (positionMap.find(task.id) != positionMap.end()) {
            updateTask(task);
            return;
        }

        size_t index = heapArray.size();
        heapArray.push_back(task);
        positionMap[task.id] = index;
        heapifyUp(index);
    }

    // Retrieve minimum (highest scheduling precedence) task — O(1)
    const Task& getMin() const {
        if (heapArray.empty()) {
            throw std::runtime_error("Heap is empty: No task available to schedule.");
        }
        return heapArray[0];
    }

    // Extract minimum task from heap — O(log n)
    Task extractMin() {
        if (heapArray.empty()) {
            throw std::runtime_error("Heap underflow: Cannot extract from empty heap.");
        }

        Task rootTask = heapArray[0];
        positionMap.erase(rootTask.id);

        if (heapArray.size() == 1) {
            heapArray.pop_back();
            return rootTask;
        }

        // Move last element to root and heapify down
        heapArray[0] = heapArray.back();
        positionMap[heapArray[0].id] = 0;
        heapArray.pop_back();

        heapifyDown(0);
        return rootTask;
    }

    // Arbitrary task update: updates attributes and restores heap invariants
    bool updateTask(const Task& updatedTask) {
        auto it = positionMap.find(updatedTask.id);
        if (it == positionMap.end()) {
            return false;
        }

        size_t index = it->second;
        Task oldTask = heapArray[index];
        heapArray[index] = updatedTask;

        // Determine whether to bubble up or trickle down
        if (comparator(updatedTask, oldTask)) {
            heapifyUp(index);
        } else {
            heapifyDown(index);
        }
        return true;
    }

    // Arbitrary task removal by ID
    bool removeById(const std::string& taskId) {
        auto it = positionMap.find(taskId);
        if (it == positionMap.end()) {
            return false;
        }

        size_t index = it->second;
        positionMap.erase(taskId);

        if (index == heapArray.size() - 1) {
            heapArray.pop_back();
            return true;
        }

        Task movedTask = heapArray.back();
        heapArray[index] = movedTask;
        positionMap[movedTask.id] = index;
        heapArray.pop_back();

        // Fix position in either direction
        heapifyDown(index);
        heapifyUp(index);
        return true;
    }

    // Bulk build from vector: Floyd's build-heap algorithm — O(n)
    void buildHeap(const std::vector<Task>& tasks) {
        heapArray = tasks;
        positionMap.clear();

        for (size_t i = 0; i < heapArray.size(); ++i) {
            positionMap[heapArray[i].id] = i;
        }

        if (heapArray.empty()) return;

        // Start from last non-leaf node: (n / 2) - 1 down to 0
        int startIndex = static_cast<int>(heapArray.size() / 2) - 1;
        for (int i = startIndex; i >= 0; --i) {
            heapifyDown(static_cast<size_t>(i));
        }
    }

    // Rebuild heap in-place — O(n)
    void rebuildHeap() {
        if (heapArray.empty()) return;
        int startIndex = static_cast<int>(heapArray.size() / 2) - 1;
        for (int i = startIndex; i >= 0; --i) {
            heapifyDown(static_cast<size_t>(i));
        }
    }

    // Invariant verification — O(n)
    bool validateHeap() const {
        for (size_t i = 0; i < heapArray.size(); ++i) {
            size_t left = 2 * i + 1;
            size_t right = 2 * i + 2;

            if (left < heapArray.size()) {
                if (comparator(heapArray[left], heapArray[i])) {
                    return false; // Left child has higher precedence than parent
                }
            }
            if (right < heapArray.size()) {
                if (comparator(heapArray[right], heapArray[i])) {
                    return false; // Right child has higher precedence than parent
                }
            }
        }
        return true;
    }

    const std::vector<Task>& getHeapArray() const {
        return heapArray;
    }

private:
    std::vector<Task> heapArray;
    std::unordered_map<std::string, size_t> positionMap;
    TaskComparator comparator;

    void swapNodes(size_t i, size_t j) {
        std::swap(heapArray[i], heapArray[j]);
        positionMap[heapArray[i].id] = i;
        positionMap[heapArray[j].id] = j;
    }

    void heapifyUp(size_t index) {
        while (index > 0) {
            size_t parent = (index - 1) / 2;
            if (comparator(heapArray[index], heapArray[parent])) {
                swapNodes(index, parent);
                index = parent;
            } else {
                break;
            }
        }
    }

    void heapifyDown(size_t index) {
        size_t size = heapArray.size();
        while (true) {
            size_t smallest = index;
            size_t left = 2 * index + 1;
            size_t right = 2 * index + 2;

            if (left < size && comparator(heapArray[left], heapArray[smallest])) {
                smallest = left;
            }

            if (right < size && comparator(heapArray[right], heapArray[smallest])) {
                smallest = right;
            }

            if (smallest != index) {
                swapNodes(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }
};

} // namespace nexora

