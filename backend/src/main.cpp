#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <chrono>

#if defined(_WIN32)
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
typedef int socklen_t;
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#define SOCKET int
#define INVALID_SOCKET -1
#define SOCKET_ERROR -1
#define closesocket close
#endif

// Include our core models, DSA, managers and JSON utils
#include "models/Task.hpp"
#include "dsa/MinHeap.hpp"
#include "managers/Scheduler.hpp"
#include "utils/JsonUtils.hpp"

int PORT = 8080;

void sendHttpResponse(SOCKET clientSocket, const std::string& statusCode, const std::string& body) {
    std::ostringstream response;
    response << "HTTP/1.1 " << statusCode << "\r\n"
             << "Content-Type: application/json\r\n"
             << "Content-Length: " << body.length() << "\r\n"
             << "Access-Control-Allow-Origin: *\r\n"
             << "Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS\r\n"
             << "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
             << "Connection: close\r\n"
             << "\r\n"
             << body;

    std::string respStr = response.str();
    send(clientSocket, respStr.c_str(), static_cast<int>(respStr.length()), 0);
    closesocket(clientSocket);
}

void handleClient(SOCKET clientSocket, nexora::Scheduler& scheduler) {
    char buffer[8192];
    int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

    if (bytesReceived <= 0) {
        closesocket(clientSocket);
        return;
    }

    buffer[bytesReceived] = '\0';
    std::string rawRequest(buffer);

    // Split headers and body
    std::string headerPart = rawRequest;
    std::string bodyPart = "";
    size_t headerEnd = rawRequest.find("\r\n\r\n");
    if (headerEnd != std::string::npos) {
        headerPart = rawRequest.substr(0, headerEnd);
        bodyPart = rawRequest.substr(headerEnd + 4);
    } else {
        headerEnd = rawRequest.find("\n\n");
        if (headerEnd != std::string::npos) {
            headerPart = rawRequest.substr(0, headerEnd);
            bodyPart = rawRequest.substr(headerEnd + 2);
        }
    }

    // Read remaining body if Content-Length exceeds received chunk
    size_t clPos = headerPart.find("Content-Length:");
    if (clPos == std::string::npos) clPos = headerPart.find("content-length:");
    if (clPos != std::string::npos) {
        size_t valStart = headerPart.find_first_of("0123456789", clPos);
        size_t lineEnd = headerPart.find_first_of("\r\n", valStart);
        int expectedLen = std::stoi(headerPart.substr(valStart, lineEnd - valStart));
        while (static_cast<int>(bodyPart.length()) < expectedLen) {
            char extra[4096];
            int n = recv(clientSocket, extra, sizeof(extra) - 1, 0);
            if (n <= 0) break;
            extra[n] = '\0';
            bodyPart.append(extra, n);
        }
    }

    // Parse HTTP request line
    std::istringstream requestStream(headerPart);
    std::string method, path, version;
    requestStream >> method >> path >> version;

    std::cout << "[HTTP] " << method << " " << path << std::endl;

    // 0. Handle OPTIONS for CORS Preflight
    if (method == "OPTIONS") {
        std::ostringstream response;
        response << "HTTP/1.1 204 No Content\r\n"
                 << "Access-Control-Allow-Origin: *\r\n"
                 << "Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS\r\n"
                 << "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
                 << "Content-Length: 0\r\n"
                 << "\r\n";
        std::string respStr = response.str();
        send(clientSocket, respStr.c_str(), static_cast<int>(respStr.length()), 0);
        closesocket(clientSocket);
        return;
    }

    // 1. Health Endpoint: GET /api/v1/health
    if (method == "GET" && (path == "/api/v1/health" || path == "/health")) {
        std::ostringstream json;
        json << "{\n"
             << "  \"status\": \"ok\",\n"
             << "  \"application\": \"NEXORA\",\n"
             << "  \"backend\": \"C++ Crow\",\n"
             << "  \"port\": " << PORT << ",\n"
             << "  \"activeQueueSize\": " << scheduler.getQueueSize() << "\n"
             << "}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 2. GET /api/v1/tasks — Retrieve all tasks
    if (method == "GET" && path == "/api/v1/tasks") {
        std::vector<nexora::Task> allTasks;
        const auto& store = scheduler.getAllTasks();
        for (const auto& pair : store) {
            allTasks.push_back(pair.second);
        }

        std::string json = nexora::tasksVectorToJson(allTasks);
        sendHttpResponse(clientSocket, "200 OK", json);
        return;
    }

    // 3. GET /api/v1/scheduler/next — Return next recommended task using custom C++ Min Heap
    if (method == "GET" && path == "/api/v1/scheduler/next") {
        nexora::Task nextTask;
        bool found = scheduler.getNextTask(nextTask);

        if (!found) {
            sendHttpResponse(clientSocket, "200 OK", "{\n  \"task\": null,\n  \"message\": \"Queue is empty. No eligible tasks pending.\"\n}");
            return;
        }

        std::ostringstream json;
        json << "{\n"
             << "  \"task\": " << nexora::taskToJson(nextTask) << ",\n"
             << "  \"algorithmMode\": \"" << (scheduler.getMode() == nexora::SchedulingMode::DEADLINE_FIRST ? "DEADLINE_FIRST" : "OTHER") << "\",\n"
             << "  \"explanation\": \"" << nexora::escapeJson(nextTask.schedulingReason) << "\"\n"
             << "}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 4. POST /api/v1/tasks — Create a new task
    if (method == "POST" && path == "/api/v1/tasks") {
        std::string title = nexora::extractJsonString(bodyPart, "title");
        std::string description = nexora::extractJsonString(bodyPart, "description");
        int64_t priorityVal = nexora::extractJsonInt64(bodyPart, "priority", 2);
        int64_t deadline = nexora::extractJsonInt64(bodyPart, "deadline", 0);
        int64_t estimated = nexora::extractJsonInt64(bodyPart, "estimatedMinutes", 30);

        // Validation
        if (title.empty()) {
            sendHttpResponse(clientSocket, "400 Bad Request", "{\n  \"error\": \"Validation Error\",\n  \"message\": \"Task title cannot be empty\"\n}");
            return;
        }

        if (priorityVal < 1 || priorityVal > 3) {
            priorityVal = 2; // Default to Medium
        }

        if (deadline <= 0) {
            // Default: due in 24 hours if not provided
            int64_t nowMs = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now().time_since_epoch()).count();
            deadline = nowMs + 86400000LL;
        }

        std::string customId = nexora::extractJsonString(bodyPart, "id");
        if (customId.empty()) {
            customId = "task-" + std::to_string(std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now().time_since_epoch()).count());
        }

        nexora::Priority p = static_cast<nexora::Priority>(priorityVal);
        nexora::Task newTask(customId, "user-default", title, deadline, p);
        newTask.description = description;
        newTask.estimatedMinutes = static_cast<int>(estimated);

        // Insert into core C++ scheduling engine
        scheduler.addTask(newTask);

        std::cout << "[NEXORA] Created Task ID: " << newTask.id << " in C++ Min Heap. Queue size: " << scheduler.getQueueSize() << std::endl;

        std::ostringstream response;
        response << "{\n"
                 << "  \"message\": \"Task created successfully in C++ scheduling engine\",\n"
                 << "  \"task\": " << nexora::taskToJson(newTask) << "\n"
                 << "}";
        sendHttpResponse(clientSocket, "201 Created", response.str());
        return;
    }

    // 5. PATCH /api/v1/tasks/{id}/complete — Complete a task
    if ((method == "PATCH" || method == "POST") && path.rfind("/api/v1/tasks/", 0) == 0 && path.find("/complete") != std::string::npos) {
        // Extract task ID from "/api/v1/tasks/{id}/complete"
        std::string prefix = "/api/v1/tasks/";
        std::string remainder = path.substr(prefix.length());
        size_t slashPos = remainder.find('/');
        std::string taskId = remainder.substr(0, slashPos);

        if (!scheduler.hasTask(taskId)) {
            sendHttpResponse(clientSocket, "404 Not Found", "{\n  \"error\": \"Task not found\",\n  \"taskId\": \"" + taskId + "\"\n}");
            return;
        }

        scheduler.completeTask(taskId);
        std::cout << "[NEXORA] Completed Task ID: " << taskId << ". New heap size: " << scheduler.getQueueSize() << std::endl;

        const nexora::Task* updated = scheduler.getTask(taskId);
        std::ostringstream json;
        json << "{\n"
             << "  \"message\": \"Task completed successfully\",\n"
             << "  \"task\": " << (updated ? nexora::taskToJson(*updated) : "null") << "\n"
             << "}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 6. DELETE /api/v1/tasks/{id} — Delete a task
    if (method == "DELETE" && path.rfind("/api/v1/tasks/", 0) == 0) {
        std::string prefix = "/api/v1/tasks/";
        std::string taskId = path.substr(prefix.length());

        if (!scheduler.hasTask(taskId)) {
            sendHttpResponse(clientSocket, "404 Not Found", "{\n  \"error\": \"Task not found\",\n  \"taskId\": \"" + taskId + "\"\n}");
            return;
        }

        scheduler.removeTask(taskId);
        std::cout << "[NEXORA] Deleted Task ID: " << taskId << " from C++ Engine. New heap size: " << scheduler.getQueueSize() << std::endl;

        std::ostringstream json;
        json << "{\n"
             << "  \"message\": \"Task deleted successfully from C++ engine\",\n"
             << "  \"taskId\": \"" << taskId << "\"\n"
             << "}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 7. PUT /api/v1/tasks/{id} — Update task
    if ((method == "PUT" || method == "PATCH") && path.rfind("/api/v1/tasks/", 0) == 0 && path.find("/complete") == std::string::npos) {
        std::string prefix = "/api/v1/tasks/";
        std::string taskId = path.substr(prefix.length());

        if (!scheduler.hasTask(taskId)) {
            sendHttpResponse(clientSocket, "404 Not Found", "{\n  \"error\": \"Task not found\",\n  \"taskId\": \"" + taskId + "\"\n}");
            return;
        }

        const nexora::Task* existing = scheduler.getTask(taskId);
        nexora::Task updated = *existing;

        std::string title = nexora::extractJsonString(bodyPart, "title");
        if (!title.empty()) updated.title = title;

        std::string desc = nexora::extractJsonString(bodyPart, "description");
        if (!desc.empty()) updated.description = desc;

        std::string cat = nexora::extractJsonString(bodyPart, "categoryId");
        if (!cat.empty()) updated.categoryId = cat;

        int64_t priorityVal = nexora::extractJsonInt64(bodyPart, "priority", -1);
        if (priorityVal >= 1 && priorityVal <= 3) updated.priority = static_cast<nexora::Priority>(priorityVal);

        int64_t deadline = nexora::extractJsonInt64(bodyPart, "deadline", 0);
        if (deadline > 0) updated.deadline = deadline;

        int64_t estMin = nexora::extractJsonInt64(bodyPart, "estimatedMinutes", 0);
        if (estMin > 0) updated.estimatedMinutes = static_cast<int>(estMin);

        int64_t actMin = nexora::extractJsonInt64(bodyPart, "actualMinutes", -1);
        if (actMin >= 0) updated.actualMinutes = static_cast<int>(actMin);

        std::string statusStr = nexora::extractJsonString(bodyPart, "status");
        if (statusStr == "COMPLETED") updated.status = nexora::TaskStatus::COMPLETED;
        else if (statusStr == "IN_PROGRESS") updated.status = nexora::TaskStatus::IN_PROGRESS;
        else if (statusStr == "PENDING") updated.status = nexora::TaskStatus::PENDING;

        updated.updatedAt = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();

        scheduler.updateTask(updated);

        std::ostringstream json;
        json << "{\n  \"message\": \"Task updated successfully\",\n  \"task\": " << nexora::taskToJson(updated) << "\n}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 8. POST /api/v1/scheduler/mode — Change scheduling mode
    if (method == "POST" && path == "/api/v1/scheduler/mode") {
        std::string modeStr = nexora::extractJsonString(bodyPart, "mode");
        nexora::SchedulingMode newMode = nexora::SchedulingMode::DEADLINE_FIRST;

        if (modeStr == "PRIORITY_FIRST") newMode = nexora::SchedulingMode::PRIORITY_FIRST;
        else if (modeStr == "SMART_URGENCY") newMode = nexora::SchedulingMode::SMART_URGENCY;
        else if (modeStr == "BALANCED") newMode = nexora::SchedulingMode::BALANCED;
        else newMode = nexora::SchedulingMode::DEADLINE_FIRST;

        scheduler.setMode(newMode);
        std::cout << "[NEXORA] Switched scheduling mode to " << modeStr << ". Rebuilt heap size: " << scheduler.getQueueSize() << std::endl;

        std::ostringstream json;
        json << "{\n"
             << "  \"message\": \"Scheduling mode updated\",\n"
             << "  \"mode\": \"" << modeStr << "\",\n"
             << "  \"activeQueueSize\": " << scheduler.getQueueSize() << "\n"
             << "}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 9. GET /api/v1/scheduler/heap — Get raw internal min heap array representation
    if (method == "GET" && (path == "/api/v1/scheduler/heap" || path == "/api/v1/dsa/heap")) {
        const auto& heapArray = scheduler.getHeapArray();
        std::ostringstream json;
        json << "{\n"
             << "  \"mode\": \"" << (scheduler.getMode() == nexora::SchedulingMode::DEADLINE_FIRST ? "DEADLINE_FIRST" :
                                   (scheduler.getMode() == nexora::SchedulingMode::PRIORITY_FIRST ? "PRIORITY_FIRST" :
                                   (scheduler.getMode() == nexora::SchedulingMode::SMART_URGENCY ? "SMART_URGENCY" : "BALANCED"))) << "\",\n"
             << "  \"heapSize\": " << heapArray.size() << ",\n"
             << "  \"tasks\": " << nexora::tasksVectorToJson(heapArray) << "\n"
             << "}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 10. GET /api/v1/dependencies — Get graph dependencies & topological order
    if (method == "GET" && path == "/api/v1/dependencies") {
        const auto& adj = scheduler.getDependencyManager().getAdjacencyList();
        auto topoOrder = scheduler.getDependencyManager().getTopologicalOrder();
        bool cycle = scheduler.getDependencyManager().hasCycle();

        std::ostringstream json;
        json << "{\n"
             << "  \"hasCycle\": " << (cycle ? "true" : "false") << ",\n"
             << "  \"edges\": [\n";

        bool firstEdge = true;
        for (const auto& pair : adj) {
            const std::string& dependent = pair.first;
            for (const auto& prereq : pair.second) {
                if (!firstEdge) json << ",\n";
                firstEdge = false;
                json << "    {\"dependentTaskId\": \"" << nexora::escapeJson(dependent)
                     << "\", \"prerequisiteTaskId\": \"" << nexora::escapeJson(prereq) << "\"}";
            }
        }
        json << "\n  ],\n  \"topologicalOrder\": [";
        for (size_t i = 0; i < topoOrder.size(); ++i) {
            json << "\"" << nexora::escapeJson(topoOrder[i]) << "\"";
            if (i + 1 < topoOrder.size()) json << ", ";
        }
        json << "]\n}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 11. POST /api/v1/dependencies — Add dependency edge
    if (method == "POST" && path == "/api/v1/dependencies") {
        std::string dependent = nexora::extractJsonString(bodyPart, "dependentTaskId");
        std::string prereq = nexora::extractJsonString(bodyPart, "prerequisiteTaskId");

        if (dependent.empty() || prereq.empty()) {
            sendHttpResponse(clientSocket, "400 Bad Request", "{\"error\": \"Missing dependentTaskId or prerequisiteTaskId\"}");
            return;
        }

        bool success = scheduler.addDependency(dependent, prereq);
        if (!success) {
            sendHttpResponse(clientSocket, "409 Conflict", "{\"error\": \"Dependency would create a cyclic dependency in DAG\"}");
            return;
        }

        std::ostringstream json;
        json << "{\n  \"message\": \"Dependency added successfully\",\n"
             << "  \"dependentTaskId\": \"" << nexora::escapeJson(dependent) << "\",\n"
             << "  \"prerequisiteTaskId\": \"" << nexora::escapeJson(prereq) << "\"\n}";
        sendHttpResponse(clientSocket, "201 Created", json.str());
        return;
    }

    // 12. DELETE /api/v1/dependencies — Remove dependency edge
    if (method == "DELETE" && path == "/api/v1/dependencies") {
        std::string dependent = nexora::extractJsonString(bodyPart, "dependentTaskId");
        std::string prereq = nexora::extractJsonString(bodyPart, "prerequisiteTaskId");

        scheduler.removeDependency(dependent, prereq);

        std::ostringstream json;
        json << "{\n  \"message\": \"Dependency removed successfully\"\n}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // 13. GET /api/v1/system/diagnostics — Backend diagnostics
    if (method == "GET" && path == "/api/v1/system/diagnostics") {
        int64_t nowMs = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
        std::ostringstream json;
        json << "{\n"
             << "  \"status\": \"healthy\",\n"
             << "  \"application\": \"NEXORA\",\n"
             << "  \"engine\": \"C++17 Crow/POSIX Socket Core\",\n"
             << "  \"port\": " << PORT << ",\n"
             << "  \"totalRegisteredTasks\": " << scheduler.getAllTasks().size() << ",\n"
             << "  \"activeHeapQueueSize\": " << scheduler.getQueueSize() << ",\n"
             << "  \"schedulingMode\": \"" << (scheduler.getMode() == nexora::SchedulingMode::DEADLINE_FIRST ? "DEADLINE_FIRST" :
                                             (scheduler.getMode() == nexora::SchedulingMode::PRIORITY_FIRST ? "PRIORITY_FIRST" :
                                             (scheduler.getMode() == nexora::SchedulingMode::SMART_URGENCY ? "SMART_URGENCY" : "BALANCED"))) << "\",\n"
             << "  \"currentTimeMs\": " << nowMs << ",\n"
             << "  \"memoryModel\": \"Contiguous Zero-Based Vector MinHeap\",\n"
             << "  \"cycleDetector\": \"3-Color DFS Machine\"\n"
             << "}";
        sendHttpResponse(clientSocket, "200 OK", json.str());
        return;
    }

    // Default 404
    sendHttpResponse(clientSocket, "404 Not Found", "{\n  \"error\": \"Not Found\",\n  \"message\": \"Endpoint does not exist\"\n}");
}

int main(int argc, char* argv[]) {
    if (const char* envPort = std::getenv("PORT")) {
        try { PORT = std::stoi(envPort); } catch (...) {}
    } else if (argc > 1) {
        try { PORT = std::stoi(argv[1]); } catch (...) {}
    }

    std::cout << "===========================================\n" << std::flush;
    std::cout << "   NEXORA C++ REST API ENGINE (PORT " << PORT << ")   \n" << std::flush;
    std::cout << "===========================================\n" << std::flush;

#if defined(_WIN32)
    WSADATA wsaData;
    int wsaInit = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (wsaInit != 0) {
        std::cerr << "[ERROR] Winsock initialization failed: " << wsaInit << "\n" << std::flush;
        return 1;
    }
#endif

    // Initialize our C++ Scheduling Engine with baseline tasks
    nexora::Scheduler scheduler(nexora::SchedulingMode::DEADLINE_FIRST);

    int64_t nowMs = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();

    nexora::Task t1("task-101", "user-default", "Deploy Production Hotfix", nowMs + 7200000LL, nexora::Priority::HIGH);
    nexora::Task t2("task-102", "user-default", "Prepare DSA Lecture Slides", nowMs + 86400000LL, nexora::Priority::MEDIUM);
    scheduler.addTask(t1);
    scheduler.addTask(t2);

    std::cout << "[NEXORA] C++ Core DSA Scheduling Engine initialized.\n" << std::flush;
    std::cout << "[NEXORA] Active tasks in C++ MinHeap: " << scheduler.getQueueSize() << "\n" << std::flush;

    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == INVALID_SOCKET) {
        std::cerr << "[ERROR] Could not create server socket.\n" << std::flush;
#if defined(_WIN32)
        WSACleanup();
#endif
        return 1;
    }

    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
    serverAddr.sin_port = htons(PORT);

    if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
        if (PORT == 8080) {
            std::cout << "[INFO] Port 8080 is already occupied, falling back to port 8081...\n" << std::flush;
            PORT = 8081;
            serverAddr.sin_port = htons(PORT);
            if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
                std::cerr << "[ERROR] Bind failed on port " << PORT << "\n" << std::flush;
                closesocket(serverSocket);
#if defined(_WIN32)
                WSACleanup();
#endif
                return 1;
            }
        } else {
            std::cerr << "[ERROR] Bind failed on port " << PORT << "\n" << std::flush;
            closesocket(serverSocket);
#if defined(_WIN32)
            WSACleanup();
#endif
            return 1;
        }
    }

    if (listen(serverSocket, 20) == SOCKET_ERROR) {
        std::cerr << "[ERROR] Listen failed on socket.\n" << std::flush;
        closesocket(serverSocket);
#if defined(_WIN32)
        WSACleanup();
#endif
        return 1;
    }

    std::cout << "[NEXORA] REST Server ready on http://localhost:" << PORT << "\n" << std::flush;
    std::cout << "[NEXORA] Endpoints ready:\n"
              << "         - GET    /api/v1/health\n"
              << "         - GET    /api/v1/tasks\n"
              << "         - POST   /api/v1/tasks\n"
              << "         - GET    /api/v1/scheduler/next\n"
              << "         - PATCH  /api/v1/tasks/{id}/complete\n"
              << "         - DELETE /api/v1/tasks/{id}\n" << std::flush;

    while (true) {
        sockaddr_in clientAddr;
        socklen_t clientLen = sizeof(clientAddr);
        SOCKET clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientLen);

        if (clientSocket != INVALID_SOCKET) {
            handleClient(clientSocket, scheduler);
        }
    }

    closesocket(serverSocket);
#if defined(_WIN32)
    WSACleanup();
#endif
    return 0;
}
