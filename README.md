# audio-visual
convert 3d data to sound

web audio api docs:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

oscillator node:
https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode

gain node: 
https://developer.mozilla.org/en-US/docs/Web/API/GainNode

slider:
https://www.npmjs.com/package/react-rangeslider
example slider:
https://whoisandy.github.io/react-rangeslider/

example making beeps in js:
https://marcgg.com/blog/2016/11/01/javascript-audio/


spacialization:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics

Oculus spacialization:
https://developer.oculus.com/documentation/audiosdk/latest/concepts/audio-intro-spatialization/


HRTF database:
http://recherche.ircam.fr/equipes/salles/listen/
Demo sounds:
http://recherche.ircam.fr/equipes/salles/listen/sounds.html

Interesting (from oculus):

https://developer.oculus.com/documentation/audiosdk/latest/concepts/audio-intro-sounddesign/

Use Wide Spectrum Sources
For the same reasons that pure tones are poor for spatialization, broad spectrum sounds work well by providing lots of frequencies for the HRTF to work with. They also help mask audible glitches that result from dynamic changes to HRTFs, pan, and attenuation. In addition to a broad spectrum of frequencies, ensure that there is significant frequency content above 1500 Hz, since this is used heavily by humans for sound localization.

Low frequency sounds are difficult for humans to locate - this is why home theater systems use a monophonic subwoofer channel. If a sound is predominantly low frequency (rumbles, drones, shakes, et cetera), then you can avoid the overhead of spatialization and use pan/attenuation instead.

Google audio:
https://developers.google.com/vr/reference/ios-ndk/group/audio
