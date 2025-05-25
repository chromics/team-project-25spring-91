-- CreateTable
CREATE TABLE "competitions" (
    "competition_id" SERIAL NOT NULL,
    "gym_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT,
    "max_participants" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("competition_id")
);

-- CreateTable
CREATE TABLE "competition_tasks" (
    "task_id" SERIAL NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "exercise_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_value" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "points_value" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "competition_tasks_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "competition_users" (
    "participant_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "completion_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "competition_users_pkey" PRIMARY KEY ("participant_id")
);

-- CreateTable
CREATE TABLE "competition_progress" (
    "progress_id" SERIAL NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "current_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completion_date" TIMESTAMP(3),
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "competition_progress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competition_users_user_id_competition_id_key" ON "competition_users"("user_id", "competition_id");

-- CreateIndex
CREATE UNIQUE INDEX "competition_progress_participant_id_task_id_key" ON "competition_progress"("participant_id", "task_id");

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_tasks" ADD CONSTRAINT "competition_tasks_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("competition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_tasks" ADD CONSTRAINT "competition_tasks_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("exercise_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_users" ADD CONSTRAINT "competition_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_users" ADD CONSTRAINT "competition_users_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("competition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_progress" ADD CONSTRAINT "competition_progress_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "competition_users"("participant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_progress" ADD CONSTRAINT "competition_progress_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "competition_tasks"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;
