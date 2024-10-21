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
  res.json({ message: 'Implement Me!'})    
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
  res.json({ message: 'Implement Me!'})   
})

app.post('/applications', async (req, res) => {
  res.json({ message: 'Implement Me!'})
})

app.get('/applications/search', async (req, res) => {
  res.json({ message: 'Implement Me!'})
})

export default app;