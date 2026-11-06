#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <chrono>

#include <winsock2.h>
#include <ws2tcpip.h>

// Include our core models, DSA, managers and JSON utils
#include "models/Task.hpp"
#include "dsa/MinHeap.hpp"
#include "managers/Scheduler.hpp"
#include "utils/JsonUtils.hpp"

const int PORT = 8080;

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

    // Default 404
    sendHttpResponse(clientSocket, "404 Not Found", "{\n  \"error\": \"Not Found\",\n  \"message\": \"Endpoint does not exist\"\n}");
}

int main() {
    std::cout << "===========================================\n" << std::flush;
    std::cout << "   NEXORA C++ REST API ENGINE (PORT 8080)   \n" << std::flush;
    std::cout << "===========================================\n" << std::flush;

    WSADATA wsaData;
    int wsaInit = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (wsaInit != 0) {
        std::cerr << "[ERROR] Winsock initialization failed: " << wsaInit << "\n" << std::flush;
        return 1;
    }

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
        WSACleanup();
        return 1;
    }

    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
    serverAddr.sin_port = htons(PORT);

    if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
        std::cerr << "[ERROR] Bind failed on port " << PORT << "\n" << std::flush;
        closesocket(serverSocket);
        WSACleanup();
        return 1;
    }

    if (listen(serverSocket, 20) == SOCKET_ERROR) {
        std::cerr << "[ERROR] Listen failed on socket.\n" << std::flush;
        closesocket(serverSocket);
        WSACleanup();
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
        int clientLen = sizeof(clientAddr);
        SOCKET clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientLen);

        if (clientSocket != INVALID_SOCKET) {
            handleClient(clientSocket, scheduler);
        }
    }

    closesocket(serverSocket);
    WSACleanup();
    return 0;
}
