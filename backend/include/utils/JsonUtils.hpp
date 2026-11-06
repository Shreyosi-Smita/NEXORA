#pragma once

#include "models/Task.hpp"
#include <string>
#include <sstream>
#include <vector>

namespace nexora {

inline std::string escapeJson(const std::string& s) {
    std::ostringstream o;
    for (char c : s) {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else if (c == '\b') o << "\\b";
        else if (c == '\f') o << "\\f";
        else if (c == '\n') o << "\\n";
        else if (c == '\r') o << "\\r";
        else if (c == '\t') o << "\\t";
        else o << c;
    }
    return o.str();
}

inline std::string taskToJson(const Task& task) {
    std::ostringstream ss;
    ss << "{\n"
       << "  \"id\": \"" << escapeJson(task.id) << "\",\n"
       << "  \"userId\": \"" << escapeJson(task.userId) << "\",\n"
       << "  \"title\": \"" << escapeJson(task.title) << "\",\n"
       << "  \"description\": \"" << escapeJson(task.description) << "\",\n"
       << "  \"deadline\": " << task.deadline << ",\n"
       << "  \"priority\": " << static_cast<int>(task.priority) << ",\n"
       << "  \"status\": \"" << (task.status == TaskStatus::COMPLETED ? "COMPLETED" : "PENDING") << "\",\n"
       << "  \"estimatedMinutes\": " << task.estimatedMinutes << ",\n"
       << "  \"actualMinutes\": " << task.actualMinutes << ",\n"
       << "  \"progressPercentage\": " << task.progressPercentage << ",\n"
       << "  \"createdAt\": " << task.createdAt << ",\n"
       << "  \"updatedAt\": " << task.updatedAt << ",\n"
       << "  \"completedAt\": " << task.completedAt << ",\n"
       << "  \"calculatedUrgencyScore\": " << task.calculatedUrgencyScore << ",\n"
       << "  \"schedulingReason\": \"" << escapeJson(task.schedulingReason) << "\"\n"
       << "}";
    return ss.str();
}

inline std::string tasksVectorToJson(const std::vector<Task>& tasks) {
    std::ostringstream ss;
    ss << "[\n";
    for (size_t i = 0; i < tasks.size(); ++i) {
        ss << taskToJson(tasks[i]);
        if (i + 1 < tasks.size()) {
            ss << ",\n";
        }
    }
    ss << "\n]";
    return ss.str();
}

inline std::string extractJsonString(const std::string& json, const std::string& key) {
    std::string searchKey = "\"" + key + "\"";
    size_t keyPos = json.find(searchKey);
    if (keyPos == std::string::npos) return "";

    size_t colonPos = json.find(':', keyPos + searchKey.length());
    if (colonPos == std::string::npos) return "";

    size_t firstQuote = json.find('"', colonPos);
    if (firstQuote == std::string::npos) return "";

    size_t secondQuote = json.find('"', firstQuote + 1);
    while (secondQuote != std::string::npos && json[secondQuote - 1] == '\\') {
        secondQuote = json.find('"', secondQuote + 1);
    }
    if (secondQuote == std::string::npos) return "";

    return json.substr(firstQuote + 1, secondQuote - firstQuote - 1);
}

inline int64_t extractJsonInt64(const std::string& json, const std::string& key, int64_t defaultValue = 0) {
    std::string searchKey = "\"" + key + "\"";
    size_t keyPos = json.find(searchKey);
    if (keyPos == std::string::npos) return defaultValue;

    size_t colonPos = json.find(':', keyPos + searchKey.length());
    if (colonPos == std::string::npos) return defaultValue;

    size_t start = json.find_first_of("0123456789-", colonPos);
    if (start == std::string::npos) return defaultValue;

    size_t end = json.find_first_not_of("0123456789-", start);
    std::string numStr = (end == std::string::npos) ? json.substr(start) : json.substr(start, end - start);
    try {
        return std::stoll(numStr);
    } catch (...) {
        return defaultValue;
    }
}

} // namespace nexora
