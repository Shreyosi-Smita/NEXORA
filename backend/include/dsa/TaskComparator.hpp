#pragma once

#include "models/Task.hpp"
#include <memory>
#include <cmath>

namespace nexora {

class TaskComparator {
public:
    explicit TaskComparator(SchedulingMode mode = SchedulingMode::DEADLINE_FIRST)
        : currentMode(mode) {}

    void setMode(SchedulingMode mode) {
        currentMode = mode;
    }

    SchedulingMode getMode() const {
        return currentMode;
    }

    // Returns true if a has HIGHER priority (should be scheduled before b in min-heap)
    bool operator()(const Task& a, const Task& b) const {
        switch (currentMode) {
            case SchedulingMode::PRIORITY_FIRST:
                return comparePriorityFirst(a, b);
            case SchedulingMode::BALANCED:
                return compareBalanced(a, b);
            case SchedulingMode::SMART_URGENCY:
                return compareSmartUrgency(a, b);
            case SchedulingMode::DEADLINE_FIRST:
            default:
                return compareDeadlineFirst(a, b);
        }
    }

private:
    SchedulingMode currentMode;

    // 1. Deadline-First Comparator
    // Rule:
    // a) Earliest deadline first
    // b) If deadlines equal, higher priority first (High: 1 < Medium: 2 < Low: 3)
    // c) If both equal, earlier creation timestamp first
    // d) Deterministic tie-breaker: taskId
    bool compareDeadlineFirst(const Task& a, const Task& b) const {
        if (a.deadline != b.deadline) {
            return a.deadline < b.deadline;
        }
        if (static_cast<int>(a.priority) != static_cast<int>(b.priority)) {
            return static_cast<int>(a.priority) < static_cast<int>(b.priority);
        }
        if (a.createdAt != b.createdAt) {
            return a.createdAt < b.createdAt;
        }
        return a.id < b.id;
    }

    // 2. Priority-First Comparator
    // Rule: Highest priority first, then earliest deadline, then creation, then taskId
    bool comparePriorityFirst(const Task& a, const Task& b) const {
        if (static_cast<int>(a.priority) != static_cast<int>(b.priority)) {
            return static_cast<int>(a.priority) < static_cast<int>(b.priority);
        }
        if (a.deadline != b.deadline) {
            return a.deadline < b.deadline;
        }
        if (a.createdAt != b.createdAt) {
            return a.createdAt < b.createdAt;
        }
        return a.id < b.id;
    }

    // 3. Balanced Scheduling
    // Balances deadline proximity and priority rank with normalization
    bool compareBalanced(const Task& a, const Task& b) const {
        // Balanced score = (deadline_diff_hours * 0.6) + (priority_val * 24.0 * 0.4)
        // Smaller score has higher precedence
        int64_t nowMs = 1762282000000LL; // Reference baseline or dynamically set
        double scoreA = computeBalancedScore(a, nowMs);
        double scoreB = computeBalancedScore(b, nowMs);

        if (std::abs(scoreA - scoreB) > 1e-4) {
            return scoreA < scoreB;
        }
        return a.id < b.id;
    }

    // 4. Smart Urgency Scoring
    // Computes heuristic weight score. Higher score = higher precedence in execution.
    // In min-heap, we invert so higher score bubbles to top.
    bool compareSmartUrgency(const Task& a, const Task& b) const {
        if (std::abs(a.calculatedUrgencyScore - b.calculatedUrgencyScore) > 1e-4) {
            return a.calculatedUrgencyScore > b.calculatedUrgencyScore; // Higher score first
        }
        if (a.deadline != b.deadline) {
            return a.deadline < b.deadline;
        }
        return a.id < b.id;
    }

    double computeBalancedScore(const Task& t, int64_t /*nowMs*/) const {
        double deadlineHours = static_cast<double>(t.deadline) / 3600000.0;
        double priorityWeight = static_cast<double>(t.priority) * 12.0;
        return deadlineHours + priorityWeight;
    }
};

} // namespace nexora

