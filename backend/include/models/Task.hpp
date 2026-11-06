#pragma once

#include <string>
#include <vector>
#include <chrono>
#include <cstdint>

namespace nexora {

enum class Priority : int {
    HIGH = 1,
    MEDIUM = 2,
    LOW = 3
};

enum class TaskStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    OVERDUE,
    PAUSED,
    CANCELLED
};

enum class SchedulingMode {
    DEADLINE_FIRST,
    PRIORITY_FIRST,
    BALANCED,
    SMART_URGENCY,
    CUSTOM
};

struct Task {
    std::string id;
    std::string userId;
    std::string title;
    std::string description;
    std::string categoryId;
    std::vector<std::string> tags;
    
    // Timestamps stored as UTC milliseconds or epoch seconds
    int64_t deadline{0};     // Epoch milliseconds
    int64_t createdAt{0};    // Epoch milliseconds
    int64_t updatedAt{0};    // Epoch milliseconds
    int64_t completedAt{0};  // Epoch milliseconds
    
    Priority priority{Priority::MEDIUM};
    TaskStatus status{TaskStatus::PENDING};
    
    int estimatedMinutes{30};
    int actualMinutes{0};
    int progressPercentage{0};
    int version{1};
    bool isArchived{false};
    
    // Dependency tracking
    std::vector<std::string> dependencies; // Task IDs that this task depends on
    
    // Evaluation metadata
    double calculatedUrgencyScore{0.0};
    std::string schedulingReason;

    Task() = default;

    Task(std::string taskId, std::string uId, std::string taskTitle, int64_t taskDeadline, Priority p)
        : id(std::move(taskId)), userId(std::move(uId)), title(std::move(taskTitle)),
          deadline(taskDeadline), priority(p) {
        createdAt = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
        updatedAt = createdAt;
    }
};

} // namespace nexora

