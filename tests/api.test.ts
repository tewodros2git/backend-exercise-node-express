import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define an interface for the application data
interface Application {
  employeeId: number;
  employee: {
    firstName: string;
    lastName: string;
  };
}

interface PostApplication {
  id: number;
  leave_start_date: string;
  leave_end_date: string;
  employeeId: number;
}


describe('Benefit API Test', () => {
  it('should return a list of benefits', async () => {
    const res = await request(app).get('/benefits');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].name).toEqual('Medical Leave')
  });  
})

describe('Employee API Tests', () => {
  it('should return an employee by id, without their secret', async () => {
    const res = await request(app).get('/employees/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.firstName).toEqual('Jane');
    expect(res.body.secret).toBeUndefined();
  });

  it('should return a 404 when employee not found by id', async () => {
    const res = await request(app).get('/employees/3');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Employee not found.");
  });

  it('should patch and employee first and last name', async () => {
    const res = await request(app).patch('/employees/1').send({ firstName: 'Zoe', lastName: 'Sanchez'});    expect(res.statusCode).toEqual(200);
    expect(res.body.firstName).toEqual('Zoe');
    expect(res.body.lastName).toEqual('Sanchez');
  });

  it('should return a 404 when employee to patch not found by id', async () => {
    const res = await request(app).patch('/employees/99').send({ firstName: 'Zoe', lastName: 'Sanchez'});
    console.log(res.body.errors);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Employee not found.");
  });

  it('should return a 400 when invalid patch request', async () => {
    const res = await request(app).patch('/employees/99').send({ lastName: ''});
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("lastName can not be blank.");
  });

})

describe('Applications API Tests', () => {
    
  beforeAll(async () => {
  });

  afterAll(async () => {
      await prisma.$disconnect();
  });

  test('should create a single application', async () => {
      const response = await request(app)
          .post('/applications')
          .send({
              leave_start_date: "2024-11-01",
              leave_end_date: "2024-11-10",
              employeeId: 2 
          });

      expect(response.status).toBe(201);
      expect(response.body[0].leave_start_date.split('T')[0]).toBe('2024-11-01');
      expect(response.body[0].leave_end_date.split('T')[0]).toBe('2024-11-10');
      expect(response.body[0].employeeId).toBe(2);
  });

  test('should create multiple applications', async () => {
    const applications = [
      { leave_start_date: '2024-11-01', leave_end_date: '2024-11-10', employeeId: 1 },
      { leave_start_date: '2024-12-01', leave_end_date: '2024-12-10', employeeId: 2 },
    ];
  
    const response = await request(app)
        .post('/applications')
        .send(applications);
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(applications.length);
  
    response.body.forEach((app:PostApplication, index:number) => {
        expect(app.leave_start_date.split('T')[0]).toBe(applications[index].leave_start_date);
        expect(app.leave_end_date.split('T')[0]).toBe(applications[index].leave_end_date);
        expect(app.employeeId).toBe(applications[index].employeeId);
    });
  });
 
  test('should return 400 for missing required fields', async () => {
      const response = await request(app)
          .post('/applications')
          .send({
              leave_start_date: "2024-11-01",
              employeeId: 2
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing required fields: leave_start_date, leave_end_date, and employeeId.');
  });

  test('should return 400 for non-existent employee ID', async () => {
      const response = await request(app)
          .post('/applications')
          .send({
              leave_start_date: "2024-11-01",
              leave_end_date: "2024-11-10",
              employeeId: 9999 
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Employee ID 9999 does not exist.');
  });

  it('should return all applications if no parameters are provided', async () => {
    const response = await request(app)
      .get('/applications/search')
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toHaveProperty('total');
  });

  it('should return applications by employee ID', async () => {
    const response = await request(app)
      .get('/applications/search')
      .query({ employeeId: 1 })  
      .expect(200);

    (response.body.data as Application[]).forEach((app) => {
      expect(app.employeeId).toBe(1);
    });
  });

  it('should return applications by first name', async () => {
    const response = await request(app)
      .get('/applications/search')
      .query({ firstName: 'Tewodros' })
      .expect(200);

    (response.body.data as Application[]).forEach((app) => {
      expect(app.employee.firstName).toContain('tewodros');
    });
  });

  it('should return applications by last name', async () => {
    const response = await request(app)
      .get('/applications/search')
      .query({ lastName: 'Shume' })
      .expect(200);

    (response.body.data as Application[]).forEach((app) => {
      expect(app.employee.lastName).toContain('shume');
    });
  });

  it('should paginate results correctly', async () => {
    const response = await request(app)
      .get('/applications/search')
      .query({ page: 2, limit: 5 })
      .expect(200);

    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.pageSize).toBeLessThanOrEqual(5);
    expect(response.body.pagination).toHaveProperty('totalPages');
  });
});
