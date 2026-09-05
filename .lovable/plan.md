# Add microscopic evidence to Atherosclerosis

## Build
- Add the approved CC BY 4.0 histology image through the project asset flow and keep the original source links visible.
- Create a focused `MicroscopicEvidence` component with an unobtrusive disclosure control, three selectable stage views, careful crops of the composite image, adjacent CardioLab labels, captions, and the required limitation note.
- Map Early, Advanced, and Late evidence to the appropriate existing atherosclerosis stages without implying that every mechanism-map stage has a matching photograph.
- Add an accessible detail view with keyboard-operable open/close controls, descriptive text, and a complete study/image/licence credit drawer.
- Insert the panel beneath the existing interactive mechanism map so all current pathway controls, arrows, recall, and other lessons remain unchanged.

## Technical details
- Use semantic design tokens and existing CardioLab control patterns; no unlicensed imagery or book screenshots.
- Use stable responsive crop regions for the three panels and disable nonessential transitions under reduced-motion preferences.
- Verify the hosted image loads, stage selection and detail controls work by keyboard, mobile and desktop layouts remain usable, and the lesson has no console or route errors.
