cmake_minimum_required(VERSION 3.16)
project(NexoraEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Crow and standalone server sources
file(GLOB_RECURSE BACKEND_HEADERS "include/*.hpp")
file(GLOB_RECURSE BACKEND_SOURCES "src/*.cpp")

# Core Engine library
add_library(nexora_core STATIC
    include/models/Task.hpp
    include/dsa/MinHeap.hpp
    include/dsa/TaskComparator.hpp
    include/dsa/DependencyManager.hpp
    include/managers/Scheduler.hpp
)

# Test target
add_executable(test_dsa tests/test_dsa.cpp)
target_link_libraries(test_dsa PRIVATE nexora_core)

# API Server target
if (EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp")
    add_executable(nexora_server src/main.cpp ${BACKEND_SOURCES})
    target_link_libraries(nexora_server PRIVATE nexora_core)
endif()

