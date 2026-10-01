# Project Camp Backend 🚀

> **Status:** 🚧 Work in Progress (Not yet completed)

## Project Overview

**Project Camp Backend** is a backend API service designed to power a collaborative project management system. It handles server-side logic like user accounts, project organization, task tracking, and role-based security.

## Core Features

* **User Authentication & Security:** Secure registration, JWT-based login, email verification, password reset, and a three-tier permission system (Admin, Project Admin, Member).
* **Project Management:** Create, view, update, and delete projects, alongside tracking member counts and managing project notes.
* **Team Collaboration:** Invite users via email, manage rosters, and update member roles within specific projects.
* **Task & Subtask System:** Create tasks with file attachments, assign them to teammates, track statuses (**Todo**, **In Progress**, **Done**), and break tasks down further using subtasks.
* **System Health:** Includes a dedicated health check endpoint for monitoring API status.