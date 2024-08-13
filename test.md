
## Processes
- Process  Process_1 Restart 
- Process  Process_0qt9v06 Restart 
## Elements

- Element: **StartEvent_1** bpmn:StartEvent, 

- Element: **task1** bpmn:UserTask, Task 1

- Element: **task2** bpmn:UserTask, Task 2

- Element: **Activity_07xn6ll** bpmn:UserTask, 

- Element: **Event_0nk4lyk** bpmn:EndEvent, 

- Element: **start2** bpmn:StartEvent, Start 2

- Element: **Activity_0ioiwzl** bpmn:ScriptTask, 
## Sequence Flows

- Flow: **Flow_18ywrur** bpmn:SequenceFlow  StartEvent_1 task1

- Flow: **Flow_1dhfwjj** bpmn:SequenceFlow  task1 task2

- Flow: **Flow_0s52ud9** bpmn:SequenceFlow  task2 Activity_07xn6ll

- Flow: **Flow_0jliv7h** bpmn:SequenceFlow  Activity_07xn6ll Event_0nk4lyk

- Flow: **Flow_12u99lh** bpmn:SequenceFlow  start2 Activity_0ioiwzl