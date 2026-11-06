#include "dsa/MinHeap.hpp"
#include "dsa/DependencyManager.hpp"
#include "managers/Scheduler.hpp"
#include <iostream>
#include <cassert>
#include <vector>
#include <string>

using namespace nexora;

void testMinHeapOperations() {
    std::cout << "[TEST] Running MinHeap core operations test...\n";
    MinHeap heap(SchedulingMode::DEADLINE_FIRST);

    assert(heap.isEmpty());
    assert(heap.size() == 0);

    // Insert task 1: Deadline 1000, High Priority
    Task t1("task-1", "user-1", "High Priority Early", 1000, Priority::HIGH);
    // Insert task 2: Deadline 500, Medium Priority
    Task t2("task-2", "user-1", "Medium Priority Earliest", 500, Priority::MEDIUM);
    // Insert task 3: Deadline 1500, Low Priority
    Task t3("task-3", "user-1", "Low Priority Late", 1500, Priority::LOW);

    heap.insert(t1);
    heap.insert(t2);
    heap.insert(t3);

    assert(heap.size() == 3);
    assert(heap.validateHeap());

    // t2 has the earliest deadline (500)
    assert(heap.getMin().id == "task-2");

    // Extract root
    Task extracted = heap.extractMin();
    assert(extracted.id == "task-2");
    assert(heap.size() == 2);
    assert(heap.validateHeap());

    // Next should be t1 (1000)
    assert(heap.getMin().id == "task-1");

    // Update t3 deadline to 300 -> should bubble to top
    t3.deadline = 300;
    heap.updateTask(t3);
    assert(heap.getMin().id == "task-3");
    assert(heap.validateHeap());

    // Remove task-3
    heap.removeById("task-3");
    assert(heap.size() == 1);
    assert(heap.getMin().id == "task-1");
    assert(heap.validateHeap());

    std::cout << "[PASS] MinHeap core operations test passed successfully.\n";
}

void testPriorityTieBreakers() {
    std::cout << "[TEST] Running Priority tie-breaker test on equal deadlines...\n";
    MinHeap heap(SchedulingMode::DEADLINE_FIRST);

    // Both tasks have identical deadline: 1000
    Task tLow("task-low", "user-1", "Low Task", 1000, Priority::LOW);
    Task tHigh("task-high", "user-1", "High Task", 1000, Priority::HIGH);

    heap.insert(tLow);
    heap.insert(tHigh);

    assert(heap.validateHeap());
    // In deadline-first, identical deadlines break tie with priority (High < Low)
    assert(heap.getMin().id == "task-high");

    std::cout << "[PASS] Priority tie-breaker test passed successfully.\n";
}

void testDependencyManager() {
    std::cout << "[TEST] Running DependencyManager DAG & Cycle Detection...\n";
    DependencyManager dm;

    // A -> B (B depends on A)
    // B -> C (C depends on B)
    assert(dm.addDependency("task-B", "task-A") == true);
    assert(dm.addDependency("task-C", "task-B") == true);

    // Cycle attempt: A depends on C (creates cycle A -> B -> C -> A)
    assert(dm.addDependency("task-A", "task-C") == false);
    assert(dm.hasCycle() == false);

    // Eligibility check
    std::unordered_set<std::string> completed;
    assert(dm.isTaskEligible("task-A", completed) == true);
    assert(dm.isTaskEligible("task-B", completed) == false); // Needs A

    completed.insert("task-A");
    assert(dm.isTaskEligible("task-B", completed) == true);
    assert(dm.isTaskEligible("task-C", completed) == false); // Needs B

    std::cout << "[PASS] DependencyManager tests passed successfully.\n";
}

int main() {
    std::cout << "===========================================\n";
    std::cout << "   NEXORA CORE DSA ENGINE TEST SUITE       \n";
    std::cout << "===========================================\n";

    testMinHeapOperations();
    testPriorityTieBreakers();
    testDependencyManager();

    std::cout << "\nALL DSA INVARIANT TESTS PASSED VERIFIED!\n";
    return 0;
}

