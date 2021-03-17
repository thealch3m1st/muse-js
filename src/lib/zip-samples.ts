import { from, merge, Observable } from 'rxjs';
import { mergeMap, concatAll } from 'rxjs/operators';
import { EEG_FREQUENCY } from './../muse';
import { EEGReading, PPGReading } from './muse-interfaces';

export interface EEGSample {
    index: number;
    timestamp: number; // milliseconds since epoch
    data: number;
}

export interface PPGSample {
    index: number;
    timestamp: number; // milliseconds since epoch
    data: number;
}

export function zipSamples(eegReadings: Observable<EEGReading>): Observable<EEGSample[]> {
    const observable = new Observable(subscriber => {
        const buffer: EEGReading[] = []
        var lastTimestamp: number | null = null;
        eeg
    })
    
    // const buffer: EEGReading[] = [];
    // let lastTimestamp: number | null = null;
    // return eegReadings.pipe(
    //     mergeMap((reading) => {
    //         if (reading.timestamp !== lastTimestamp) {
    //             lastTimestamp = reading.timestamp;
    //             if (buffer.length) {
    //                 const result = from([[...buffer]]);
    //                 buffer.splice(0, buffer.length, reading);
    //                 return result;
    //             }
    //         }
    //         buffer.push(reading);
    //         return from([]);
    //     }),
    //     concatAll(),
    //     mergeMap((readings: EEGReading[]) => {
    //         const result = readings[0].samples.map((x, index) => {
    //             const data = [NaN, NaN, NaN, NaN, NaN];
    //             for (const reading of readings) {
    //                 data[reading.electrode] = reading.samples[index];
    //             }
    //             return {
    //                 data,
    //                 index: readings[0].index,
    //                 timestamp: readings[0].timestamp + (index * 1000) / EEG_FREQUENCY,
    //             };
    //         });
    //         return from(result);
    //     }),
    // );
    return eegReadings.pipe(
        mergeMap(()
    )
}

export function zipSamplesPPG(ppgReadings: Observable<PPGReading>): Observable<PPGSample> {
    const buffer: PPGReading[] = [];
    let lastTimestamp: number | null = null;
    return ppgReadings.pipe(
        mergeMap((reading) => {
            if (reading.timestamp !== lastTimestamp) {
                lastTimestamp = reading.timestamp;
                if (buffer.length) {
                    const result = from([[...buffer]]);
                    buffer.splice(0, buffer.length, reading);
                    return result;
                }
            }
            buffer.push(reading);
            return from([buffer]);
        }),
        concat(from([buffer])),
        mergeMap((readings: PPGReading[]) => {
            const result = readings[0].samples.map((x, index) => {
                const data = [NaN, NaN, NaN, NaN];
                for (const reading of readings) {
                    data[reading.channel] = reading.samples[index];
                }
                return {
                    data,
                    index: readings[0].index,
                    timestamp: readings[0].timestamp + (index * 1000) / EEG_FREQUENCY,
                };
            });
            return from(result);
        }),
    );
}
