import RPi.GPIO as GPIO
#set up GPIO using BCM numbering
GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(24, GPIO.IN, pull_up_down=GPIO.PUD_UP)
def printFunction(channel):
    if channel == 23:
        channel = 1
    if channel == 24:
        channel = 2        
    print("Button " + str(channel) + " pressed!")    
GPIO.add_event_detect(23, GPIO.RISING, callback=printFunction, bouncetime=300)
GPIO.add_event_detect(24, GPIO.FALLING, callback=printFunction, bouncetime=300)
while True:
    continue
GPIO.cleanup()
