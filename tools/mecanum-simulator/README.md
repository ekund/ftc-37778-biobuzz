# FTC mecanum simulator

A plain black-and-white browser simulator for a mecanum drivetrain. No build step or package installation is needed.

## Run it

Open `index.html` in a browser, or run this in Terminal:

```sh
cd tools/mecanum-simulator
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open http://127.0.0.1:8000. Press Control+C in Terminal to stop the server.

## Use it

- Adjust all four motor powers and the duration in seconds, then click **Add step**.
- To edit a step, select it, change the values, and click **Update selected**.
- Click **Run route** to simulate the sequence.
- Decimal values work in duration, starting pose, simulation settings, and encoder settings.
- The **Java editor** accepts the four named `.setPower(number)` calls and `sleep(milliseconds)`. Click **Apply Java** to load that sequence.
- **Export FTC Java** downloads `RevUpRoute.java`, an FTC SDK `LinearOpMode`. Match the hardware-map names and motor directions to your robot.

## Field and starting pose

The field is 6 × 6 tiles, each 24 × 24 inches. The origin is at the top left; X increases right and Y increases downward.

The default robot is a 16-inch square. It starts facing right (90°), with center at X = 8 inches, Y = 36 inches. Its back edge touches the left wall in tile (0,1). **Start at wall (0,1)** restores this pose using the current robot size.

The loading zone is 23 inches along the left wall and 11 inches deep into the field, centered in tile (0,1). It has no vertical height limit.

## Simulation assumptions

These are editable starting values, not measurements from your robot. Hardware and movement calibration still need to be checked against your robot.

- REV HD Hex motor: 28 encoder counts per motor revolution and 6000 no-load RPM.
- REV DUO mecanum wheels: nominal 75 mm diameter.
- Nominal 60:1 UltraPlanetary stack: actual reduction `(84/29) * (76/21) * (68/13)` ≈ 54.832891:1.
- Direct wheel drive; external reduction 1:1.
- Speed scale 0.8 and strafe scale 0.85 are illustrative assumptions.
- The model assumes linear speed versus power, an X-pattern wheel arrangement, and no acceleration. It stops at a field wall. It does not connect to a robot.
- Exported Java runs a timed route; it is not an encoder-target distance controller.

Encoder conversion: `ticks per inch = motor counts × actual reduction × external reduction / (π × wheel diameter in inches)`.

Sources: [REV wheels](https://docs.revrobotics.com/duo-build/motion/wheels), [HD Hex motor](https://docs.revrobotics.com/duo-build/motion/motors/hd-hex-motor), [actual cartridge ratios](https://docs.revrobotics.com/rev-crossover-products/ultraplanetary/cartridge-details), [FTC SDK mecanum sample](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/BasicOmniOpMode_Linear.java).

## Files

- `index.html` — page layout and settings.
- `style.css` — simple black-and-white styling.
- `app.js` — movement simulation, controls, Java import/export, encoder calculations.
- `tests/simulator.cjs` — logic checks; run with `node tests/simulator.cjs` (or `npm test`). Node is only needed for these checks.

The browser saves routes and settings locally in localStorage. No server or account is needed.
