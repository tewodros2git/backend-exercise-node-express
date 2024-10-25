/*
  Warnings:

  - You are about to drop the `Application` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Application";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leave_start_date" DATETIME NOT NULL,
    "leave_end_date" DATETIME NOT NULL,
    "employeeId" INTEGER NOT NULL,
    CONSTRAINT "applications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
