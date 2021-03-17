// tslint:disable:no-console

import { PPGReading } from '../../src/lib/muse-interfaces';
import { zipSamples, zipSamplesPPG } from '../../src/lib/zip-samples';
import { channelNames, EEGReading, MuseClient, ppgChannelNames } from './../../src/muse';

(window as any).connect = async () => {
    const graphTitles = Array.from(document.querySelectorAll('.electrode-item h3'));
    const canvases = Array.from(document.querySelectorAll('.electrode-item canvas')) as HTMLCanvasElement[];
    const canvasCtx = canvases.map((canvas) => canvas.getContext('2d'));

    const ppggraphTitles = Array.from(document.querySelectorAll('.ppg-item h3'));
    const ppgcanvases = Array.from(document.querySelectorAll('.ppg-item canvas')) as HTMLCanvasElement[];
    const ppgcanvasCtx = canvases.map((canvas) => canvas.getContext('2d'));

    graphTitles.forEach((item, index) => {
        item.textContent = channelNames[index];
    });

    ppggraphTitles.forEach((item, index) => {
        item.textContent = ppgChannelNames[index];
    });

    console.log('is this running?');

    function plot(reading: EEGReading) {
        const canvas = canvases[reading.electrode];
        const context = canvasCtx[reading.electrode];
        if (!context) {
            console.log('no context');
            return;
        }
        // console.log('context');
        const width = canvas.width / 12.0;
        const height = canvas.height / 2.0;
        context.fillStyle = 'green';
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < reading.samples.length; i++) {
            const sample = reading.samples[i] / 15;
            if (sample > 0) {
                context.fillRect(i * 25, height - sample, width, sample);
            } else {
                context.fillRect(i * 25, height, width, -sample);
            }
        }
    }

    function plotPPG(reading: PPGReading) {
        const canvas = ppgcanvases[reading.channel];
        const context = ppgcanvasCtx[reading.channel];
        if (!context) {
            console.log('no context');
            return;
        }
        console.log('context');
        const width = canvas.width / 12.0;
        const height = canvas.height / 2.0;
        context.fillStyle = 'green';
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (reading.channel !== 2) {
            // console.log(reading.samples, reading.channel);
        }
        for (let i = 0; i < reading.samples.length; i++) {
            const sample = reading.samples[2] / 100000;
            if (sample > 0) {
                context.fillRect(i * 25, height - sample, width, sample);
            } else {
                context.fillRect(i * 25, height, width, -sample);
            }
        }
    }

    const client = new MuseClient();
    client.connectionStatus.subscribe((status) => {
        console.log(status ? 'Connected!' : 'Disconnected');
    });

    try {
        client.enableAux = true;
        await client.connect();
        await client.start();
        document.getElementById('headset-name')!.innerText = client.deviceName;

        client.eegReadings.subscribe((reading) => {
            plot(reading);
            // console.log('is this working? (eegReadings)');
        });

        // client.ppgReadings.subscribe((reading) => {
        //     plotPPG(reading);
        //     // console.log('is this working? (ppgReadings)');
        // });

        // zipSamples(client.eegReadings).subscribe((reading) => {
        //     console.log(reading);
        // });

        // zipSamplesPPG(client.ppgReadings).subscribe((reading) => {
        //     console.log(reading);
        // });

        client.telemetryData.subscribe((reading) => {
            document.getElementById('temperature')!.innerText = reading.temperature.toString() + '℃';
            document.getElementById('batteryLevel')!.innerText = reading.batteryLevel.toFixed(2) + '%';
        });
        client.accelerometerData.subscribe((accel) => {
            const normalize = (v: number) => (v / 16384).toFixed(2) + 'g';
            document.getElementById('accelerometer-x')!.innerText = normalize(accel.samples[2].x);
            document.getElementById('accelerometer-y')!.innerText = normalize(accel.samples[2].y);
            document.getElementById('accelerometer-z')!.innerText = normalize(accel.samples[2].z);
        });
        await client.deviceInfo().then((deviceInfo) => {
            document.getElementById('hardware-version')!.innerText = deviceInfo.hw;
            document.getElementById('firmware-version')!.innerText = deviceInfo.fw;
        });
    } catch (err) {
        console.error('Connection failed', err);
    }
};
