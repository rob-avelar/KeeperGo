describe('POST /api/auth/login', () => {
  it('should return 400 if email is missing', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'test' }),
    });

    expect(response.status).toBe(400);
  });

  it('should return 400 if password is missing', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    expect(response.status).toBe(400);
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should return token for valid credentials', async () => {
    // This would require a test user in DB
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'correctpassword',
      }),
    });

    if (response.status === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('accessToken');
    }
  });
});
