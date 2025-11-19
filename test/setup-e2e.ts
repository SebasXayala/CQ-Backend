// Setup global para pruebas E2E
beforeAll(async () => {
    // Configurar timeout global para pruebas E2E
    jest.setTimeout(30000);
});

afterAll(async () => {
    // Limpiar recursos globales si es necesario
    await new Promise(resolve => setTimeout(resolve, 500));
});
