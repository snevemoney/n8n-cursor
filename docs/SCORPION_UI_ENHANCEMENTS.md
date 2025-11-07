# 🦂 Scorpion UI Enhancements

**Date**: 2025-01-27

## New UI Components & Features

### 1. Notification Badge Component
**Location**: `apps/scorpion/components/scorpion/NotificationBadge.tsx`

**Features**:
- Displays critical notifications and pending approvals on homepage
- Auto-refreshes every 30 seconds
- Shows up to 3 critical notifications
- Approve/Reject buttons for pending approvals
- Dismiss functionality
- Link to full notifications page

**Usage**: Automatically displayed on homepage

### 2. Chat Correction UI
**Location**: `apps/scorpion/app/(scorpion)/chat/page.tsx`

**Features**:
- "Correct" button on each assistant message
- Inline correction editor
- Submit correction to `/api/chat/correct`
- Updates message after correction
- Prevents duplicate corrections

**Usage**: Click "Correct" button on any assistant message

### 3. Notifications Page
**Location**: `apps/scorpion/app/(scorpion)/notifications/page.tsx`

**Features**:
- View all unread notifications
- View pending approvals
- Approve/Reject actions
- Dismiss notifications
- Auto-refresh every 30 seconds
- Severity indicators
- Type icons

**Access**: Via navigation menu or homepage badge

## Updated Components

### Homepage (`apps/scorpion/app/(scorpion)/page.tsx`)
- Added `NotificationBadge` component
- Shows critical notifications when user returns

### Layout (`apps/scorpion/app/(scorpion)/layout.tsx`)
- Added "Notifications" navigation item
- Added Bell icon import

### Component Exports (`apps/scorpion/components/scorpion/index.ts`)
- Exported `NotificationBadge` component

## API Endpoints Used

### `/api/notifications`
- `GET ?homepage=true` - Get homepage notifications
- `GET` - Get all notifications and pending approvals
- `POST { action: 'approve', approvalId }` - Approve action
- `POST { action: 'reject', approvalId }` - Reject action
- `POST { action: 'read', notificationId }` - Mark as read

### `/api/chat/correct`
- `POST { originalInput, wrongOutput, correctedOutput, correction }` - Submit correction

## User Flow

### Notification Flow
1. System detects dangerous action or critical event
2. Notification created and stored in ontology
3. Notification badge appears on homepage
4. User clicks notification or navigates to notifications page
5. User approves/rejects or dismisses
6. Action executed or cancelled

### Correction Flow
1. User chats with Scorpion
2. Assistant provides response
3. User clicks "Correct" button
4. User edits response in inline editor
5. User submits correction
6. Correction sent to `/api/chat/correct`
7. Mistake learner records correction
8. Training data collector adds to dataset
9. Message updated in UI

## Visual Design

### Notification Badge
- Fixed position: top-right
- Max width: 384px (max-w-md)
- Z-index: 50
- Color-coded borders based on type
- Icons for each notification type

### Chat Correction
- Inline editor below message
- Textarea for correction input
- Submit/Cancel buttons
- Visual feedback on correction

### Notifications Page
- Panel layout
- Pending approvals highlighted in red
- Data table for all notifications
- Action buttons for each notification

---

**Status**: ✅ Complete

