import * as fs from 'fs'
import pkg from '@tonejs/midi'
const { Midi } = pkg
const fileName = "Bad_Apple_slower"
const midiData = fs.readFileSync(`score/${fileName}.mid`)
const midi = new Midi(midiData)
const REDSTONE_TICKS_PER_SECOND_IN_MINECRAFT = 10


for (let trackNumber = 0; trackNumber < midi.tracks.length; trackNumber++) {
    let ncSong = {
        tickOfSection: 16,
        score: [[]]
    }
    const track = midi.tracks[trackNumber];

    // console.log(track)
    const notes = track.notes
    // console.log(JSON.stringify(notes, undefined, "    "))


    function getPitchAndInstrument(noteName) {

        const octave = noteName.slice(-1)
        const note = noteName.slice(0, -1)

        let pitch
        const pitchMap = ['F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F']
        pitch = pitchMap.lastIndexOf(note)

        let instrument
        if (octave < 3 || (octave == 3 && pitch > pitchMap.lastIndexOf('B'))) instrument = "low"
        else if (octave < 5 || (octave == 5 && pitch > pitchMap.lastIndexOf('B'))) instrument = null
        else instrument = "high"


        if (octave % 2 == 0 && pitch < pitchMap.lastIndexOf('C')) pitch += 12
        else if (octave % 2 == 1 && pitch >= pitchMap.lastIndexOf('C')) pitch += 12
        // console.log(noteName, { pitch, instrument })
        return {
            pitch,
            instrument
        }
    }
    // The following snippet compute the right tick from raw time value, so it would perserve its tempo.
    // But due to precision issue, the result would sound horribly arrhythmic.

    // for (let { name, time } of notes) {
    //     while ((ncSong.score.length) * ncSong.tickOfSection <= time * REDSTONE_TICKS_PER_SECOND_IN_MINECRAFT) ncSong.score.push([])
    //     console.log(time * 10)
    //     ncSong.score[ncSong.score.length - 1].push({
    //         ...getPitchAndInstrument(name),
    //         tickOffset: Math.floor(time * REDSTONE_TICKS_PER_SECOND_IN_MINECRAFT - (ncSong.score.length - 1) * ncSong.tickOfSection)
    //     })
    // }

    // This one sets a customed tempo for the result, so it would sound better. 

    for (let note of notes) {
        const [bar, noteName] = [note.bars, note.name]
        const SECOND_PER_EIGHTH_NOTE = 0.2
        const REDSTONE_TICKS_PER_EIGHTH_NOTE = SECOND_PER_EIGHTH_NOTE * REDSTONE_TICKS_PER_SECOND_IN_MINECRAFT //tempo
        const ordinalOfEighthNote = bar * midi.header.timeSignatures[0].timeSignature[0] * (8 / midi.header.timeSignatures[0].timeSignature[1])
        // console.log(ordinalOfEighthNote)
        while ((ncSong.score.length) * ncSong.tickOfSection <= ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE) ncSong.score.push([])
        if (ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE - Math.floor(ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE) < 0.001) {
            // console.log("Will record!")
            ncSong.score[ncSong.score.length - 1].push({
                ...getPitchAndInstrument(noteName),
                tickOffset: ordinalOfEighthNote * REDSTONE_TICKS_PER_EIGHTH_NOTE - (ncSong.score.length - 1) * ncSong.tickOfSection
            })
        }
    }
    // console.log(ncSong.score)
    console.log(trackNumber)
    let file = await fs.promises.open(`out/${fileName}_${trackNumber.toString()}.json`, "w")
    file.write(JSON.stringify(ncSong, undefined, "    "))
    console.log('NZ IS JULAO')
}