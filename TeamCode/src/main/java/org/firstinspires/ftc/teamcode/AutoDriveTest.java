package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.util.ElapsedTime;

@Autonomous
public class AutoDriveTest extends LinearOpMode {


    private DcMotor flywheel;
    //private Servo pollenServo;
    //private CRServo crServo;
   //private DcMotor intakeMotor;
    private DcMotor leftFrontDrive = null;
    private DcMotor leftBackDrive = null;
    private DcMotor rightFrontDrive = null;
    private DcMotor rightBackDrive = null;

    /**
     * This autonomous code will have the robot drive away from the wall then
     * launch preloaded pollen. An optional delay is available if your team chooses
     * to start on the far side!
     */
    @Override
    public void runOpMode() {
        int targetVelocity;
        ElapsedTime autoTimer;

        leftFrontDrive  = hardwareMap.get(DcMotor.class, "fl");
        leftBackDrive  = hardwareMap.get(DcMotor.class, "bl");
        rightFrontDrive = hardwareMap.get(DcMotor.class, "fr");
        rightBackDrive = hardwareMap.get(DcMotor.class, "br");
        //flywheel = hardwareMap.get(DcMotor.class, "flywheel");
        //pollenServo = hardwareMap.get(Servo.class, "pollenServo");
        //crServo = hardwareMap.get(CRServo.class, "crServo");
        //intakeMotor = hardwareMap.get(DcMotor.class, "intakeMotor");

        // Put initialization blocks here.
        // To drive forward, most robots need the motor on one side to be reversed, because the axles point in opposite directions.
        // When run, this OpMode should start both motors driving forward. So adjust these two lines based on your first test drive.
        // Note: The settings here assume direct drive on left and right wheels.  Gear Reduction or 90 Deg drives may require direction flips
        leftFrontDrive.setDirection(DcMotor.Direction.REVERSE);
        leftBackDrive.setDirection(DcMotor.Direction.REVERSE);
        rightFrontDrive.setDirection(DcMotor.Direction.FORWARD);
        rightBackDrive.setDirection(DcMotor.Direction.FORWARD);
        //flywheel.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        targetVelocity = 1160;
        autoTimer = new ElapsedTime();
        waitForStart();
        if (opModeIsActive()) {
            // Ensures the servo for the pollen poker is in the right position pointing up
            //pollenServo.setPosition(1);

            // Enable the sleep call below (Line 51) to add a delay to the program starting
            // The default delay is 10 seconds so be sure to adjust based on your strategy!
            //sleep(10000);

            // Robot drives forward 700 milliseconds to no longer touch the wall
            autoTimer.reset();
            while (autoTimer.milliseconds() <= 700 && opModeIsActive()) {
                leftFrontDrive.setPower(-0.25);
                rightFrontDrive.setPower(-0.25);
                leftBackDrive.setPower(-0.25);
                rightBackDrive.setPower(-0.25);

            }

            // Turn off drivetrain motors to prevent extra movement
            leftFrontDrive.setPower(0);
            rightFrontDrive.setPower(0);
            leftBackDrive.setPower(0);
            rightBackDrive.setPower(0);

            // Flywheel begins launch sequence for the preloaded pollen
            autoTimer.reset();

            // The flywheel is set to spin for 15 seconds.
            //while (autoTimer.seconds() <= 15 && opModeIsActive()) {
                //((DcMotorEx) flywheel).setVelocity(targetVelocity);

                // The flywheel must be within a specified range of the target velocity for the intake and feeder servo to activate!
                //if (((DcMotorEx) flywheel).getVelocity() >= targetVelocity - 50 && ((DcMotorEx) flywheel).getVelocity() <= targetVelocity + 50) {
                   // crServo.setPower(1);
                    //intakeMotor.setPower(1);
                //} else {

                    // If the velocity is not within range, the intake and feeder servo turn off to prevent early feeding
                   // crServo.setPower(0);
                    //intakeMotor.setPower(0);
                //}
            //}
        }
    }
}
