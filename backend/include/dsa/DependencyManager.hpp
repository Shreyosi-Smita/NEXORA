#pragma once

#include "models/Task.hpp"
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stdexcept>

namespace nexora {

/**
 * DependencyManager handles task dependencies using a Directed Acyclic Graph (DAG).
 * Features:
 * - Cycle detection via Depth-First Search (DFS).
 * - Topological sort.
 * - Eligible task filtering (identifies tasks whose prerequisites are complete).
 */
class DependencyManager {
public:
    DependencyManager() = default;

    // Adds a directed edge: dependentTaskId depends on prerequisiteTaskId
    // Returns false if introducing this dependency creates a cycle.
    bool addDependency(const std::string& dependentTaskId, const std::string& prerequisiteTaskId) {
        if (dependentTaskId == prerequisiteTaskId) {
            return false; // Self-dependency forbidden
        }

        // Temporarily add edge to test for cycle
        adjacencyList[dependentTaskId].insert(prerequisiteTaskId);
        reverseAdjacencyList[prerequisiteTaskId].insert(dependentTaskId);

        if (hasCycle()) {
            // Revert edge
            adjacencyList[dependentTaskId].erase(prerequisiteTaskId);
            reverseAdjacencyList[prerequisiteTaskId].erase(dependentTaskId);
            return false;
        }

        return true;
    }

    void removeDependency(const std::string& dependentTaskId, const std::string& prerequisiteTaskId) {
        if (adjacencyList.find(dependentTaskId) != adjacencyList.end()) {
            adjacencyList[dependentTaskId].erase(prerequisiteTaskId);
        }
        if (reverseAdjacencyList.find(prerequisiteTaskId) != reverseAdjacencyList.end()) {
            reverseAdjacencyList[prerequisiteTaskId].erase(dependentTaskId);
        }
    }

    void removeTask(const std::string& taskId) {
        // Remove as prerequisite
        if (reverseAdjacencyList.find(taskId) != reverseAdjacencyList.end()) {
            for (const auto& dependent : reverseAdjacencyList[taskId]) {
                adjacencyList[dependent].erase(taskId);
            }
            reverseAdjacencyList.erase(taskId);
        }

        // Remove as dependent
        if (adjacencyList.find(taskId) != adjacencyList.end()) {
            for (const auto& prereq : adjacencyList[taskId]) {
                reverseAdjacencyList[prereq].erase(taskId);
            }
            adjacencyList.erase(taskId);
        }
    }

    // Check if task has all dependencies satisfied by completed tasks
    bool isTaskEligible(const std::string& taskId, const std::unordered_set<std::string>& completedTaskIds) const {
        auto it = adjacencyList.find(taskId);
        if (it == adjacencyList.end() || it->second.empty()) {
            return true; // No prerequisites
        }

        for (const auto& prereqId : it->second) {
            if (completedTaskIds.find(prereqId) == completedTaskIds.end()) {
                return false; // Prerequisite not satisfied
            }
        }
        return true;
    }

    // Depth-First Search (DFS) with 3-color state machine for cycle detection
    // 0: Unvisited (White), 1: Visiting (Gray), 2: Visited (Black)
    bool hasCycle() const {
        std::unordered_map<std::string, int> state; // 0=unvisited, 1=visiting, 2=visited

        for (const auto& pair : adjacencyList) {
            const std::string& node = pair.first;
            if (state[node] == 0) {
                if (dfsCheckCycle(node, state)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Topological sort (Kahn's algorithm)
    std::vector<std::string> getTopologicalOrder() const {
        std::unordered_map<std::string, int> inDegree;
        std::unordered_set<std::string> allNodes;

        for (const auto& pair : adjacencyList) {
            allNodes.insert(pair.first);
            for (const auto& neighbor : pair.second) {
                allNodes.insert(neighbor);
                inDegree[neighbor]++;
            }
            if (inDegree.find(pair.first) == inDegree.end()) {
                inDegree[pair.first] = 0;
            }
        }

        std::queue<std::string> zeroInDegreeQueue;
        for (const auto& node : allNodes) {
            if (inDegree[node] == 0) {
                zeroInDegreeQueue.push(node);
            }
        }

        std::vector<std::string> order;
        while (!zeroInDegreeQueue.empty()) {
            std::string current = zeroInDegreeQueue.front();
            zeroInDegreeQueue.pop();
            order.push_back(current);

            auto it = reverseAdjacencyList.find(current);
            if (it != reverseAdjacencyList.end()) {
                for (const auto& dependent : it->second) {
                    inDegree[dependent]--;
                    if (inDegree[dependent] == 0) {
                        zeroInDegreeQueue.push(dependent);
                    }
                }
            }
        }

        return order;
    }

    const std::unordered_map<std::string, std::unordered_set<std::string>>& getAdjacencyList() const {
        return adjacencyList;
    }

private:
    // node -> set of tasks it depends on
    std::unordered_map<std::string, std::unordered_set<std::string>> adjacencyList;
    // prerequisite -> set of tasks that depend on it
    std::unordered_map<std::string, std::unordered_set<std::string>> reverseAdjacencyList;

    bool dfsCheckCycle(const std::string& node, std::unordered_map<std::string, int>& state) const {
        state[node] = 1; // Mark as visiting

        auto it = adjacencyList.find(node);
        if (it != adjacencyList.end()) {
            for (const auto& neighbor : it->second) {
                if (state[neighbor] == 1) {
                    return true; // Cycle detected: back edge to active node
                }
                if (state[neighbor] == 0 && dfsCheckCycle(neighbor, state)) {
                    return true;
                }
            }
        }

        state[node] = 2; // Mark as finished/visited
        return false;
    }
};

} // namespace nexora

