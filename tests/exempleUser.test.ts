import { describe, it, expect } from 'vitest';
import { Types } from 'mongoose';
import { testApp } from './setup/setup';
import { ExempleUser } from '../src/interfaces/exempleUser';

const baseUrl = '/exemple-users';

const sampleExempleUser: ExempleUser = {
  name: 'John Doe',
  age: 30,
};

describe('ExempleUser routes', () => {
  it('should return an empty array when no exemple users exist', async () => {
    const res = await testApp.inject({
      method: 'GET',
      url: baseUrl,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('should create exemple users', async () => {
    const res = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { users: [sampleExempleUser] },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveLength(1);
    expect(res.json()[0].name).toBe(sampleExempleUser.name);
    expect(res.json()[0].age).toBe(sampleExempleUser.age);
  });

  it('should get exemple user by id', async () => {
    // Create a user first
    const { json } = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { users: [sampleExempleUser] },
    });

    const userId = json()[0]._id;

    const res = await testApp.inject({
      method: 'GET',
      url: `${baseUrl}/${userId}`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()._id).toBe(userId);
    expect(res.json().name).toBe(sampleExempleUser.name);
    expect(res.json().age).toBe(sampleExempleUser.age);
  });

  it('should return 404 if exemple user id is not found', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await testApp.inject({
      method: 'GET',
      url: `${baseUrl}/${fakeId}`,
    });

    expect(res.statusCode).toBe(404);
  });

  it('should update an exemple user', async () => {
    const { json } = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { users: [sampleExempleUser] },
    });

    const userId = json()[0]._id;

    const updatedData = { user: { name: 'Jane Doe', age: 25 } };

    const res = await testApp.inject({
      method: 'PATCH',
      url: `${baseUrl}/${userId}`,
      payload: updatedData,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe('Jane Doe');
    expect(res.json().age).toBe(25);
  });

  it('should return 404 when updating non-existent exemple user', async () => {
    const fakeId = new Types.ObjectId().toString();
    const updatedData = { user: { name: 'Jane Doe' } };

    const res = await testApp.inject({
      method: 'PATCH',
      url: `${baseUrl}/${fakeId}`,
      payload: updatedData,
    });

    expect(res.statusCode).toBe(404);
  });

  it('should delete an exemple user', async () => {
    const { json } = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { users: [sampleExempleUser] },
    });

    const userId = json()[0]._id;

    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/${userId}`,
    });

    expect(res.statusCode).toBe(200);

    // Verify the user was deleted
    const check = await testApp.inject({
      method: 'GET',
      url: `${baseUrl}/${userId}`,
    });

    expect(check.statusCode).toBe(404);
  });

  it('should return 404 when deleting non-existent exemple user', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await testApp.inject({
      method: 'DELETE',
      url: `${baseUrl}/${fakeId}`,
    });

    expect(res.statusCode).toBe(404);
  });

  it('should handle multiple users creation', async () => {
    const multipleUsers = [
      { name: 'Alice', age: 28 },
      { name: 'Bob', age: 35 },
      { name: 'Charlie', age: 22 },
    ];

    const res = await testApp.inject({
      method: 'POST',
      url: baseUrl,
      payload: { users: multipleUsers },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveLength(3);
    expect(res.json().map((u: ExempleUser & { _id: string }) => u.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });
});
