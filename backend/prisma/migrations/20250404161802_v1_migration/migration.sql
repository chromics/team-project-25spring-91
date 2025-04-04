-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "height_cm" INTEGER,
    "weight_kg" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "exercise_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("exercise_id")
);

-- CreateTable
CREATE TABLE "planned_workouts" (
    "planned_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "estimated_duration" INTEGER,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planned_workouts_pkey" PRIMARY KEY ("planned_id")
);

-- CreateTable
CREATE TABLE "planned_exercises" (
    "planned_exercise_id" SERIAL NOT NULL,
    "planned_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "planned_sets" INTEGER,
    "planned_reps" INTEGER,
    "planned_weight" DECIMAL(5,2),
    "planned_duration" INTEGER,

    CONSTRAINT "planned_exercises_pkey" PRIMARY KEY ("planned_exercise_id")
);

-- CreateTable
CREATE TABLE "actual_workouts" (
    "actual_id" SERIAL NOT NULL,
    "planned_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "completed_date" DATE NOT NULL,
    "completed_time" TIME,
    "actual_duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actual_workouts_pkey" PRIMARY KEY ("actual_id")
);

-- CreateTable
CREATE TABLE "actual_exercises" (
    "actual_exercise_id" SERIAL NOT NULL,
    "actual_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "planned_exercise_id" INTEGER,
    "actual_sets" INTEGER,
    "actual_reps" INTEGER,
    "actual_weight" DECIMAL(5,2),
    "actual_duration" INTEGER,

    CONSTRAINT "actual_exercises_pkey" PRIMARY KEY ("actual_exercise_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "planned_workouts" ADD CONSTRAINT "planned_workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_exercises" ADD CONSTRAINT "planned_exercises_planned_id_fkey" FOREIGN KEY ("planned_id") REFERENCES "planned_workouts"("planned_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_exercises" ADD CONSTRAINT "planned_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("exercise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_workouts" ADD CONSTRAINT "actual_workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_workouts" ADD CONSTRAINT "actual_workouts_planned_id_fkey" FOREIGN KEY ("planned_id") REFERENCES "planned_workouts"("planned_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_exercises" ADD CONSTRAINT "actual_exercises_actual_id_fkey" FOREIGN KEY ("actual_id") REFERENCES "actual_workouts"("actual_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_exercises" ADD CONSTRAINT "actual_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("exercise_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actual_exercises" ADD CONSTRAINT "actual_exercises_planned_exercise_id_fkey" FOREIGN KEY ("planned_exercise_id") REFERENCES "planned_exercises"("planned_exercise_id") ON DELETE SET NULL ON UPDATE CASCADE;
