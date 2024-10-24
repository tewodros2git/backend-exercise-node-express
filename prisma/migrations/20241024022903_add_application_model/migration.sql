-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leave_start_date" DATETIME NOT NULL,
    "leave_end_date" DATETIME NOT NULL,
    "employeeId" INTEGER NOT NULL,
    CONSTRAINT "Application_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
