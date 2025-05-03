-- CreateTable
CREATE TABLE "gyms" (
    "gym_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "contact_info" TEXT,
    "imageUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gyms_pkey" PRIMARY KEY ("gym_id")
);

-- CreateTable
CREATE TABLE "membership_plans" (
    "plan_id" SERIAL NOT NULL,
    "gym_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration_days" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "max_bookings_per_week" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "user_memberships" (
    "membership_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "gym_id" INTEGER NOT NULL,
    "plan_id" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "bookings_used_this_week" INTEGER NOT NULL DEFAULT 0,
    "last_booking_count_reset" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("membership_id")
);

-- CreateTable
CREATE TABLE "membership_payments" (
    "payment_id" SERIAL NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "gym_classes" (
    "class_id" SERIAL NOT NULL,
    "gym_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_capacity" INTEGER,
    "duration_minutes" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "members_only" BOOLEAN NOT NULL DEFAULT false,
    "difficulty_level" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gym_classes_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "class_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "instructor" TEXT,
    "current_bookings" INTEGER NOT NULL DEFAULT 0,
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "user_bookings" (
    "booking_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "membership_id" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "booking_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "booking_status" TEXT NOT NULL DEFAULT 'confirmed',
    "cancellation_reason" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_bookings_pkey" PRIMARY KEY ("booking_id")
);

-- AddForeignKey
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("plan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_payments" ADD CONSTRAINT "membership_payments_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "user_memberships"("membership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_classes" ADD CONSTRAINT "gym_classes_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "gym_classes"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookings" ADD CONSTRAINT "user_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookings" ADD CONSTRAINT "user_bookings_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "user_memberships"("membership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookings" ADD CONSTRAINT "user_bookings_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "class_schedules"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;
