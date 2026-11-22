//package org.firstinspires.ftc.teamcode;
//
//import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
//import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
//import com.qualcomm.robotcore.hardware.CRServo;
//import com.qualcomm.robotcore.hardware.DcMotor;
//import com.qualcomm.robotcore.hardware.DcMotorEx;
//import com.qualcomm.robotcore.hardware.Servo;
//
//@TeleOp
//public class REVStarterBotJava2026 extends LinearOpMode {
//
//    private DcMotor intakeMotor;
//    private DcMotor flywheel;
//    private CRServo crServo;
//    private Servo pollenServo;
//    private DcMotor leftFrontDrive;
//    private DcMotor leftBackDrive;
//    private DcMotor rightFrontDrive;
//    private DcMotor rightBackDrive;
//
//    // Setting our velocity targets. These values are in ticks per second!
//    private static final int bankVelocity = 1600;
//    private static final int farVelocity = 1900;
//    private static final int maxVelocity = 2200;
//
//    /**
//     * The section below contains the iterative OpMode for the robot to operate so
//     * long as "Stop" has not been pressed OR communication to the Driver Station
//     * has not been lost.
//     */
//    @Override
//    public void runOpMode() {
//        intakeMotor = hardwareMap.get(DcMotor.class, "intakeMotor");
//        flywheel = hardwareMap.get(DcMotor.class, "flywheel");
//        crServo = hardwareMap.get(CRServo.class, "crServo");
//        pollenServo = hardwareMap.get(Servo.class, "pollenServo");
//        leftFrontDrive = hardwareMap.get(DcMotor.class, "fl");
//        leftBackDrive = hardwareMap.get(DcMotor.class, "bl");
//        rightFrontDrive = hardwareMap.get(DcMotor.class, "fr");
//        rightBackDrive = hardwareMap.get(DcMotor.class,"br");
//
//        // Setting up motors and variables
//        leftFrontDrive.setDirection(DcMotor.Direction.REVERSE);
//        leftBackDrive.setDirection(DcMotor.Direction.REVERSE);
//        rightFrontDrive.setDirection(DcMotor.Direction.FORWARD);
//        rightBackDrive.setDirection(DcMotor.Direction.FORWARD);
//        flywheel.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
//        waitForStart();
//        if (opModeIsActive()) {
//            // Ensures the servo is up. Runs once after "Play" is pressed.
//            pollenServo.setPosition(1);
//            // Loop for the OpMode containing the functions
//            while (opModeIsActive()) {
//                intakeControls();
//                pollenPoker();
//                driving();
//                flywheelControls();
//                // Allows for velocity to be seen on the Driver Station
//                telemetry.addData("Flywheel Velocity", ((DcMotorEx) flywheel).getVelocity());
//                telemetry.update();
//            }
//        }
//    }
//
////Below are the individual functions, also called methods, for each system.
//
//    /**
//     * Intake Controls
//     * This function contains the controls for the intake system using the Core Hex.
//     */
//    private void intakeControls() {
//        // Intake in and out
//        if (gamepad1.right_bumper) {
//            intakeMotor.setPower(1);
//        } else if (gamepad1.right_trigger_pressed) {
//            intakeMotor.setPower(-1);
//        } else {
//            intakeMotor.setPower(0);
//        }
//    }
//
//    /**
//     * Controls for the Pollen poking servo
//     * This function contains the code for the servo powered pollen poker on the front of the robot.
//     */
//    private void pollenPoker() {
//        // Servo control for poking out pollen
//        if (gamepad1.crossWasPressed()) {
//            pollenServo.setPosition(0);
//        } else if (gamepad1.circleWasPressed()) {
//            pollenServo.setPosition(1);
//        }
//    }
//
//    /**
//     * Controls for Arcade Drive
//     * This function contains the code for the arcade drive controls.
//     */
//    private void driving() {
//        double max;
//        double axial;
//        double lateral;
//        double yaw;
//
//        if (gamepad1.left_stick_y + gamepad1.left_stick_x + gamepad1.right_stick_x == 0) {
//            // POV Mode uses left joystick to go forward & strafe, and right joystick to rotate.
//            axial = -gamepad2.left_stick_y;  // Note: pushing stick forward gives negative value
//            lateral = gamepad2.left_stick_x;
//            yaw = gamepad2.right_stick_x;
//        } else {
//            // POV Mode uses left joystick to go forward & strafe, and right joystick to rotate.
//            axial = -0.1 * gamepad1.left_stick_y;  // Note: pushing stick forward gives negative value
//            lateral = 0.1 * gamepad1.left_stick_x;
//            yaw = 0.1 * gamepad1.right_stick_x;
//        }
//
//        telemetry.addData("Back Left Motor variable", axial - lateral + yaw);
//        telemetry.update();
//
//
//        // Combine the joystick requests for each axis-motion to determine each wheel's power.
//        //Set up a variable for each drive wheel to save the power level for telemetry.
//
//        double leftFrontPower = axial + lateral + yaw;
//        double rightFrontPower = axial - lateral - yaw;
//        double leftBackPower = axial - lateral + yaw;
//        double rightBackPower = axial + lateral - yaw;
//
//        // Normalize the values so no wheel power exceeds 100%
//        // This ensures that the robot maintains the desired motion.
//        max = Math.max(Math.abs(leftFrontPower), Math.abs(rightFrontPower));
//        max = Math.max(max, Math.abs(leftBackPower));
//        max = Math.max(max, Math.abs(rightBackPower));
//
//        if (max > 1.0) {
//            leftFrontPower /= max;
//            rightFrontPower /= max;
//            leftBackPower /= max;
//            rightBackPower /= max;
//        }
//
//
//        // Send calculated power to wheels
//        leftFrontDrive.setPower(leftFrontPower);
//        rightFrontDrive.setPower(rightFrontPower);
//        leftBackDrive.setPower(leftBackPower);
//        rightBackDrive.setPower(rightBackPower);
//    }
//    /**
//     * Controls for the flywheel - manual and auto sequence
//     * This function contains the controls for the flywheel system.
//     */
//    private void flywheelControls() {
//        if (gamepad1.triangle) {
//            // Manual control for flywheel motor
//            ((DcMotorEx) flywheel).setVelocity(targetVelocity);
//        } else if (gamepad1.square) {
//            // Reverse flywheel
//            flywheel.setPower(-0.55);
//        } else if (gamepad1.left_bumper) {
//            ((DcMotorEx) flywheel).setVelocity(targetVelocity);
//            // Auto feed into flywheel if within a set velocity range
//            if (((DcMotorEx) flywheel).getVelocity() >= targetVelocity - 20 && ((DcMotorEx) flywheel).getVelocity() <= targetVelocity + 20) {
//                crServo.setPower(1);
//            }
//        } else if (gamepad1.dpad_up) {
//            // Manual control for feeder servo
//            crServo.setPower(1);
//        } else if (gamepad1.dpad_down) {
//            // Reverse feeder
//            crServo.setPower(-1);
//        } else {
//            // Turn off servo and motor when gamepad is not active
//            flywheel.setPower(0);
//            crServo.setPower(0);
//        }
//    }
//}
