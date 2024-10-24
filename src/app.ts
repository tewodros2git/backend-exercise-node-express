import { PrismaClient } from '@prisma/client';
import express from 'express'

// ==> import generated route functions
// import { addEmployeeRoutes } from './api/employeeRoutes';
// import { addBenefitRoutes } from './api/benefitRoutes';

// setup express routes

const app = express()
app.use(express.json());

const prisma = new PrismaClient();

// API end points

/**
   * @swagger
   * /benefits:
   *   get:
   *     summary: Fetch benefits
   *     responses:
   *       200:
   *         description: Returns a list of Benefits.
   *         content:
   *           application/json:
   *             schema: 
   *               type: array
   *               items: 
   *                 $ref: '#/components/schemas/Benefit'
   */
app.get('/benefits', async (req, res) => {  
  try {
    const benefits: any = await prisma.benefit.findMany()
    res.json(benefits);
  }
  catch (e: any) {
    console.error(e);
    res.status(400).json({ errors: e.errors });
  }    
})

/**
   * @swagger
   * /employees/{id}:
   *   get:
   *     summary: Fetch an employee by id
   *     parameters:
   *      - name: id
   *        in: path
   *        required: true
   *        description: The unique identifier of the employee.
   *        schema:
   *          type: integer
   *          example: 123
   *     responses:
   *       200:
   *         description: Returns a list of Employees.
   *         content:
   *           application/json:
   *             schema: 
   *               $ref: '#/components/schemas/Employee'
   */
app.get('/employees/:id', async (req, res) => {
  const employeeId = Number(req.params.id);
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      date_of_birth: true,
    }
  });
  if (!employee) {
    // If employee is not found, return a 404 response
    return res.status(404).json({ message: 'Employee not found' });
  }
  // Return the employee data without the 'secret' field
  res.json(employee);
    
})

/**
 * @swagger
 * /employees/{id}:
 *   patch:
 *     summary: Update employee details
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: The unique identifier of the employee.
 *        schema:
 *          type: integer
 *          example: 123
 *     requestBody:
 *       description: Partial employee details to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The first name of the employee
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The last name of the employee
 *                 example: "Smith"
 *     responses:
 *       200:
 *         description: Returns a list of Employees.
 *         content:
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/Employee'
 */
app.patch('/employees/:id', async (req, res) => {
  const employeeId = Number(req.params.id); 
  const { firstName, lastName } = req.body; 

  // Validate the input
  if (!firstName || firstName.length < 1 || !lastName || lastName.length < 1) {
    return res.status(400).json({ message: 'First name and last name must be at least 1 character long and cannot be empty.' });
  }
    // Find the employee by ID
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      // If employee is not found, return a 404 response
      return res.status(404).json({ message: 'The employee to patch does not exist' });
    }
    // Update the employee's first and last name
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName,
        lastName
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        date_of_birth: true
      }
    });

    // Return the updated employee data
    res.json(updatedEmployee);
  
})

app.post('/applications', async (req, res) => {

    const { leave_start_date, leave_end_date, employeeId } = req.body;

    // Validate required fields
    if (!leave_start_date || !leave_end_date || !employeeId) {
      return res.status(400).json({ message: 'Missing required fields: leave_start_date, leave_end_date, and employeeId.' });
    }

    // Check if the employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return res.status(400).json({ message: 'Employee ID does not exist.' });
    }

    // Create the application
    const application = await prisma.application.create({
      data: {
        leave_start_date: new Date(leave_start_date),
        leave_end_date: new Date(leave_end_date),
        employee: { connect: { id: employeeId } }  // Connect the application to the existing employee
      }
    });

    // Return the created application
    return res.status(201).json(application);
})

app.get('/applications/search', async (req, res) => {
  res.json({ message: 'Implement Me!'})
})

export default app;