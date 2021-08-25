# Conway's Game of Life

This application shows how to utilize timers to animate geometry by using [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life). The game creates a grid of squares, with each square being alive or dead, repeating a process each iteration to determine if a square should change state or stay the same. If a dead square has 2 or 3 living neighbors, it comes to life, otherwise it stays dead. If a living square has exactly 3 living neighbors, it stays alive, otherwise it becomes dead. This process can be repeated indefinitely, producing interesting visuals.

[_metadata_:annotation]:- "CONWAYSGAMEOFLIFE"

# Square Grid

To visualize the grid provided from `ConwaysGameOfLife.ts`, the sample creates a square for each living space using a `LineString3d`, which is then turned into a `Loop`.

[_metadata_:annotation]:- "SQUAREGRID"

# Timers

For this sample, we want to update the living squares on our grid on a set interval. We accomplish this by using a `Timer`. These timers are intialized with a `ClockSpeed`, which is the amount of milliseconds until the timer activates when it is started. Upon activation, the timer will call the callback function provided to `Timer.setOnExecute`. In this case, our callback function updates our grid one time, and then restarts the timer to be triggered again after ClockSpeed milliseconds.

[_metadata_:annotation]:- "TIMERS"
