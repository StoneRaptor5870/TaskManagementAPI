```
// Project Structure
/*
/task-management-api
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.ts                      # Express application setup
│   ├── server.ts                   # Server entry point
│   ├── config/                     # Configuration files
│   ├── api/                        # API routes
│   │   ├── routes/
│   │   │   ├── taskRoutes.ts
│   │   │   ├── projectRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── controllers/
│   │   │   ├── taskController.ts
│   │   │   ├── projectController.ts
│   │   │   └── userController.ts
│   │   └── middleware/
│   │       ├── auth.ts
│   │       └── validation.ts
│   ├── domain/                     # Domain models
│   │   ├── entities/
│   │   │   ├── task.ts
│   │   │   ├── project.ts
│   │   │   └── user.ts
│   │   └── factories/              # Factory Pattern Implementation
│   │       └── taskFactory.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── prismaClient.ts
│   │   └── repositories/           # Repository Pattern Implementation
│   │       ├── taskRepository.ts
│   │       ├── projectRepository.ts
│   │       └── userRepository.ts
│   └── services/                   
│       ├── taskService.ts
│       ├── projectService.ts
│       ├── userService.ts
│       └── observers/              # Observer Pattern Implementation
│           ├── notificationObserver.ts
│           ├── emailObserver.ts
│           └── eventBus.ts
└── tests/
    ├── unit/
    └── integration/
*/
```
