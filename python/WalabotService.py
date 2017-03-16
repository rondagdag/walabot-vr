from __future__ import print_function
from sys import platform
from os import system
import WalabotAPI as wlbt
import socket, sys


WALABOTDETECT = 'SENSORTARGETS'

if __name__ == '__main__':
	if len(sys.argv) == 2:
		TCP_IP = '127.0.0.1'
		TCP_PORT = int(sys.argv[1])

		wlbt.Init()  # load the WalabotSDK to the Python wrapper
		wlbt.SetSettingsFolder()  # set the path to the essetial database files
		wlbt.ConnectAny()  # establishes communication with the Walabot

		wlbt.SetProfile(wlbt.PROF_SENSOR)  # set scan profile out of the possibilities
		wlbt.SetDynamicImageFilter(wlbt.FILTER_TYPE_MTI)  # specify filter to use

		wlbt.Start()  # starts Walabot in preparation for scanning

		s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		s.bind((TCP_IP, TCP_PORT))
		s.listen(1)

		while True:
			conn, addr = s.accept()
			data = conn.recv(16)
			try:
				if data == 'STOP':
					break
				if data.startswith(WALABOTDETECT):
					conn.send('BUFFER OK')
					while True:
						wlbt.Trigger()  # initiates a scan and records signals
						targets = wlbt.GetSensorTargets()  # provides a list of identified targets
						#system('cls' if platform == 'win32' else 'clear')  # clear the terminal
						finds = '{"targets": ['
						index = 0
						for i, t in enumerate(targets):
							index += 1
        						#print('Target {}\nx = {}\ny = {}\nz = {}\n'.format(i+1, t.xPosCm, t.yPosCm, t.zPosCm))
							finds += '{"x": "%s", "y": "%s", "z": "%s"}' % (t.xPosCm, t.yPosCm, t.zPosCm)
                                			if index < len(targets):
                                    				finds += ','							
						finds += ']}'

			except:
				message = '%s' % sys.exc_value
				message = message.replace('\\', '/').replace('\n', '').replace('\r', '')
				conn.send('{"error": "%s"}' % message)
				conn.close()
				wlbt.Stop()  # stops Walabot when finished scanning
				wlbt.Disconnect()  # stops communication with Walabot
