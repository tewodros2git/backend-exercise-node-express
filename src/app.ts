import { Prisma, PrismaClient } from '@prisma/client';
import express from 'express'

// ==> import generated route functions
// import { addEmployeeRoutes } from './api/employeeRoutes';
// import { addBenefitRoutes } from './api/benefitRoutes';

// setup express routes

const app:express.Application = express()
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
    return res.status(404).json({ message: 'Employee not found.' });
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
    return res.status(400).json({ message: 'lastName can not be blank.' });
  }
    // Find the employee by ID
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      // If employee is not found, return a 404 response
      return res.status(404).json({ message: 'Employee not found.' });
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

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create applications for employee leave
 *     description: Creates one or multiple leave applications for employees.
 *     requestBody:
 *       description: An array of leave application objects, or a single leave application object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 leave_start_date:
 *                   type: string
 *                   format: date
 *                   description: The start date of the leave in YYYY-MM-DD format.
 *                   example: "2024-11-01"
 *                 leave_end_date:
 *                   type: string
 *                   format: date
 *                   description: The end date of the leave in YYYY-MM-DD format.
 *                   example: "2024-11-10"
 *                 employeeId:
 *                   type: integer
 *                   description: The unique identifier of the employee applying for leave.
 *                   example: 2
 *     responses:
 *       201:
 *         description: Successfully created the application(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique identifier of the created application.
 *                     example: 1
 *                   leave_start_date:
 *                     type: string
 *                     format: date
 *                     description: The start date of the leave.
 *                     example: "2024-11-01T00:00:00.000Z"
 *                   leave_end_date:
 *                     type: string
 *                     format: date
 *                     description: The end date of the leave.
 *                     example: "2024-11-10T00:00:00.000Z"
 *                   employeeId:
 *                     type: integer
 *                     description: The ID of the employee associated with this leave application.
 *                     example: 2
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: leave_start_date, leave_end_date, and employeeId."
 *                 data:
 *                   type: object
 *                   properties:
 *                     leave_start_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-11-01"
 *                     leave_end_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-11-10"
 *                     employeeId:
 *                       type: integer
 *                       example: 2
 *               examples:
 *                 missing_fields:
 *                   summary: Missing required fields
 *                   value:
 *                     message: "Missing required fields: leave_start_date, leave_end_date, and employeeId."
 *                     data:
 *                       leave_start_date: "2024-11-01"
 *                       employeeId: 2
 *                 employee_not_found:
 *                   summary: Employee not found
 *                   value:
 *                     message: "Employee ID 999 does not exist."
 */
app.post('/applications', async (req, res) => {
  const applicationsData = req.body;

  if (!applicationsData) {
      return res.status(400).json({ message: 'Request body cannot be empty.' });
  }

  const applicationsArray = Array.isArray(applicationsData) ? applicationsData : [applicationsData];
  const createdApplications = [];

  for (const applicationData of applicationsArray) {
      const { leave_start_date, leave_end_date, employeeId } = applicationData;

      if (!leave_start_date || !leave_end_date || !employeeId) {
          return res.status(400).json({
              message: 'Missing required fields: leave_start_date, leave_end_date, and employeeId.',
              data: applicationData 
          });
      }
      const employee = await prisma.employee.findUnique({
          where: { id: employeeId }
      });

      if (!employee) {
          return res.status(400).json({ message: `Employee ID ${employeeId} does not exist.` });
      }

      const createdApplication = await prisma.application.create({
          data: {
              leave_start_date: new Date(leave_start_date),
              leave_end_date: new Date(leave_end_date),
              employee: { connect: { id: employeeId } }
          }
      });

      createdApplications.push(createdApplication);
  }

  return res.status(201).json(createdApplications);
});

/**
 * @swagger
 * /applications/search:
 *   get:
 *     summary: Search applications by employee details
 *     description: Retrieve a paginated list of applications filtered by employee ID, first name, or last name.
 *     parameters:
 *       - name: employeeId
 *         in: query
 *         required: false
 *         description: The unique identifier of the employee.
 *         schema:
 *           type: integer
 *           example: 2
 *       - name: firstName
 *         in: query
 *         required: false
 *         description: The first name of the employee (case-insensitive).
 *         schema:
 *           type: string
 *           example: "John"
 *       - name: lastName
 *         in: query
 *         required: false
 *         description: The last name of the employee (case-insensitive).
 *         schema:
 *           type: string
 *           example: "Doe"
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination (defaults to 1).
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of results per page (defaults to 10).
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: A paginated list of applications matching the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the application.
 *                         example: 1
 *                       leave_start_date:
 *                         type: string
 *                         format: date
 *                         description: The start date of the leave.
 *                         example: "2024-11-01T00:00:00.000Z"
 *                       leave_end_date:
 *                         type: string
 *                         format: date
 *                         description: The end date of the leave.
 *                         example: "2024-11-10T00:00:00.000Z"
 *                       employeeId:
 *                         type: integer
 *                         description: The ID of the employee associated with this leave application.
 *                         example: 2
 *                       employee:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                             description: The first name of the employee.
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             description: The last name of the employee.
 *                             example: "Doe"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: The total number of applications found.
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       description: The current page of results.
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: The number of results on the current page.
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       description: The total number of pages of results.
 *                       example: 5
 *       400:
 *         description: Bad request due to invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid query parameters."
 */
app.get('/applications/search', async (req, res) => {
  const { employeeId, firstName, lastName, page = 1, limit = 10 } = req.query;

  const parsedEmployeeId = employeeId ? Number(employeeId) : undefined;
  const parsedFirstName = firstName ? String(firstName).toLowerCase() : undefined;
  const parsedLastName = lastName ? String(lastName).toLowerCase() : undefined;

  const pageNumber = parseInt(String(page), 10);
  const pageSize = parseInt(String(limit), 10);
  const skip = (pageNumber - 1) * pageSize;

  const whereClause = {
    ...(parsedEmployeeId && { employeeId: parsedEmployeeId }),
    ...(parsedFirstName || parsedLastName ? {
      employee: {
        ...(parsedFirstName && { firstName: { contains: parsedFirstName } }),
        ...(parsedLastName && { lastName: { contains: parsedLastName } })
      }
    } : {})
  };

      const applications = await prisma.application.findMany({
          where: whereClause,
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
          include: { employee: true },
      });

      const total = await prisma.application.count({ where: whereClause });

      res.json({
          data: applications,
          pagination: {
              total,
              page: pageNumber,
              pageSize: applications.length,
              totalPages: Math.ceil(total / pageSize),
          },
      });
  
});


export default app;