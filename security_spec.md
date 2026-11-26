# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. A `users/{userId}` document may only be read, created, or updated by the authenticated verified user whose `request.auth.uid == userId`, and `role` cannot be escalated on create/update.
2. A `customQuizzes/{quizId}` document must always belong to an authenticated, email-verified Google user (`ownerId == request.auth.uid`).
3. Every `customQuizzes` write enforces strict required/allowed keys, bounded string lengths, bounded `questions` list (`1 <= size <= 250`), immutable `ownerId` and `createdAt`, and server-enforced `request.time` timestamps.
4. `list` queries on `customQuizzes` explicitly enforce `resource.data.isPublic == true || (isSignedIn() && resource.data.ownerId == request.auth.uid)` in rules rather than delegating filtering to the client.

## 2. Dirty Dozen Adversarial Payloads
1. Unauthenticated create in `customQuizzes` -> `PERMISSION_DENIED`
2. Create in `customQuizzes` with `email_verified == false` -> `PERMISSION_DENIED`
3. Identity spoofing (`ownerId != request.auth.uid`) -> `PERMISSION_DENIED`
4. Shadow/ghost field injection (`isAdmin: true`) -> `PERMISSION_DENIED`
5. Client-forged `createdAt` timestamp (`!= request.time`) -> `PERMISSION_DENIED`
6. Oversized document ID (`> 128` chars or invalid characters) -> `PERMISSION_DENIED`
7. Empty or oversized `questions` array (`[]` or `> 250` items) -> `PERMISSION_DENIED`
8. Non-string / oversized `title` (`> 180` chars) -> `PERMISSION_DENIED`
9. Updating another user's quiz (`existing().ownerId != request.auth.uid`) -> `PERMISSION_DENIED`
10. Mutating immutable `ownerId` or `createdAt` during update -> `PERMISSION_DENIED`
11. Reading another user's private `users/{otherUid}` document -> `PERMISSION_DENIED`
12. Self-assigning `role: "teacher"` on `users/{uid}` creation/update -> `PERMISSION_DENIED`
