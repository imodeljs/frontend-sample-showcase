# Setting up ViewFlags

In order to enable the shadows to be displayed in this sample, we need to modify the viewFlags of our iModel. To accomplish this, we make a clone of the existing `viewFlags`, update the `shadows` flag on the cloned version, and then set the viewFlags of the iModel's viewstate to the cloned viewFlags. Attempting to change the viewFlags directly can cause undefined behavior.

[_metadata_:annotation]:- "ENABLESHADOWS"

# Getting Unix Time

The `setSunTime` method requires a single parameter, which is the desired unix time in milliseconds. A good way to get a time in unix milliseconds is through a `Date` object. These typescript built-ins represent a specific date and time. They also have a helpful function called `getTime`, which returns the unix time in milliseconds of the date and time currently being represented by the `Date` instance. By default, the `Date` object will initialize to the current date and time.  

[_metadata_:annotation]:- "GETUNIXTIME"

# Setting the Sun Time

Before updating the sun time, we first need to verify that our view is 3d. The `setSunTime` method only exists on a `displayStyle3dState`, which requires a 3d view. Once this has been verified, we can pass in our desired time in unix milliseconds, which will then update the displayStyle's shadows. Finally, we update the `viewport's` displayStyle with our updated displayStyle, which will cause the shadows to update in the view.

[_metadata_:annotation]:- "SETSUNTIME"
