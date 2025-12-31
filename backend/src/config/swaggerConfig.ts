import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Frozo Health App API',
            version: '1.0.0',
            description: 'API documentation for the Frozo Health App backend',
        },
        servers: [
            {
                url: 'http://localhost:5001/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Profile: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        relationship: { type: 'string' },
                        role: { type: 'string' },
                        dateOfBirth: { type: 'string', format: 'date-time' },
                        bloodType: { type: 'string' },
                    },
                },
                BPReading: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        profileId: { type: 'string' },
                        systolic: { type: 'integer' },
                        diastolic: { type: 'integer' },
                        pulse: { type: 'integer' },
                        status: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                },
                GlucoseReading: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        profileId: { type: 'string' },
                        value: { type: 'number' },
                        context: { type: 'string' },
                        status: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                },
                Symptom: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        profileId: { type: 'string' },
                        name: { type: 'string' },
                        severity: { type: 'string' },
                        notes: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                },
                Reminder: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        profileId: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        time: { type: 'string' },
                        completed: { type: 'boolean' },
                        completedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Document: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        profileId: { type: 'string' },
                        title: { type: 'string' },
                        category: { type: 'string' },
                        date: { type: 'string', format: 'date-time' },
                        fileUrl: { type: 'string' },
                        thumbnailUrl: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        inVisitPack: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        profileId: { type: 'string' },
                        title: { type: 'string' },
                        message: { type: 'string' },
                        type: { type: 'string' },
                        priority: { type: 'string' },
                        isRead: { type: 'boolean' },
                        timestamp: { type: 'string', format: 'date-time' },
                        actionUrl: { type: 'string' },
                    },
                },
                ProfileInput: {
                    type: 'object',
                    required: ['name', 'relationship', 'dateOfBirth'],
                    properties: {
                        name: { type: 'string' },
                        relationship: { type: 'string' },
                        dateOfBirth: { type: 'string', format: 'date-time' },
                        bloodType: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
