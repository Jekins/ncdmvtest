# DMV Handbook sign filter

Source: [official North Carolina Driver Handbook](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Documents/nc-driver-handbook.pdf), downloaded October 7, 2026 from the [NCDMV handbooks page](https://www.ncdot.gov/dmv/license-id/driver-licenses/new-drivers/Pages/handbooks.aspx).

PDF: 108 pages; modification timestamp in PDF metadata: September 10, 2026. SHA-256: `6c0fcb8f004e7fc34cea78de7167a055a3463601853135475265153c07808c0f`.

The checkbox selects the intersection of the app's existing catalog and sign types illustrated in this PDF. It also limits the flashcard learning deck. It is off initially and remembers the user's choice on this browser.

Each selected question has `handbookPages`, using printed page numbers (PDF page number = printed page + 2). The mapping was checked against rendered pages, including the work-zone examples on page 70 and the sign section on pages 83-87. Numbers, borders, distance wording, and word-versus-symbol variants can differ without changing the sign's meaning. Right/left variants are not automatically included.

There are 50 matching catalog entries. This is an intersection, not the complete set of handbook illustrations: the catalog does not yet contain, for example, Keep Right Except to Pass, Left Lane Must Turn Left, Double Left Turns, Keep Off Median, timed parking, bus-stop parking, Do Not Stop on Tracks, Farm Machinery, Soft Shoulder, School Crossing with crosswalk lines, the N.C. diamond route marker, the secondary-road number marker, the blue railroad emergency sign, or several work-zone signs.

Do not substitute generic lookalikes: the circular state marker is not the N.C. diamond, a county shield is not an N.C. secondary-road marker, a low shoulder is not a soft shoulder, Road Closed is not Road Closed Ahead, and Workers is not Flagger. Exit Only also differs from the handbook's green exit destination signs.

## Verified entries

| Catalog sign code | Short English meaning | Printed handbook pages |
| --- | --- | --- |
| R1-1 | Stop completely and go when clear. | 70, 83, 86 |
| R1-2 | Slow down and give way. | 83, 86 |
| R2-1 | Do not exceed this speed. | 86 |
| R3-1 | Do not turn right. | 83, 86 |
| R3-2 | Do not turn left. | 86 |
| R3-3 | Go straight only. | 86 |
| R3-4 | Do not make a U-turn. | 83, 86 |
| R3-5L | Turn left only from this lane. | 86 |
| R3-6L | Go straight or left from this lane. | 86 |
| R4-1 | Do not pass. | 84, 86 |
| R4-2 | Pass with care. | 86 |
| R4-3 | Slower traffic must keep right. | 86 |
| R4-7 | Keep right of the obstacle. | 83, 86 |
| R4-8 | Keep left of the obstacle. | 86 |
| R5-1 | Do not enter this road. | 86 |
| R5-6 | Bicycles are not allowed. | 86 |
| R6-1R | Go only in the arrow's direction. | 83, 86 |
| R6-2R | Go only in the arrow's direction. | 86 |
| R7-8 | Park only with a disability permit. | 83, 86 |
| R8-7 | Stop only in an emergency. | 86 |
| W1-1R | A sharp right turn is ahead. | 87 |
| W1-2R | A right curve is ahead. | 87 |
| W1-5R | A winding road is ahead. | 87 |
| W2-1 | An intersection is ahead. | 87 |
| W2-2R | A side road joins from the right. | 87 |
| W3-1 | A stop sign is ahead. | 84, 87 |
| W3-2 | A yield sign is ahead. | 87 |
| W3-3 | A traffic light is ahead. | 84, 87 |
| W4-1R | Traffic merges from the right. | 84, 87 |
| W4-2 | A lane ends ahead. | 87 |
| W6-1 | A divided road begins ahead. | 84, 87 |
| W6-2 | The divided road ends ahead. | 84, 87 |
| W6-3 | Two-way traffic is ahead. | 84, 87 |
| W7-1 | A steep downhill slope is ahead. | 84, 87 |
| W8-5 | The road may be slippery when wet. | 84, 87 |
| W11-1 | Watch for bicycles. | 84, 87 |
| W11-2 | Watch for pedestrians. | 84 |
| W11-3 | Watch for deer. | 87 |
| W11-4 | Watch for cattle. | 87 |
| W12-2 | Low clearance is ahead. | 87 |
| W14-3 | A no-passing zone begins here. | 84, 87 |
| S1-1 | A school is ahead; watch for children. | 85, 87 |
| R15-1 | Yield to trains at the crossing. | 61, 84, 85, 86 |
| W10-1 | A railroad crossing is ahead. | 60, 84, 87 |
| M1-1 | This is an Interstate highway number. | 85 |
| M1-4 | This is a U.S. highway number. | 85 |
| D1-1 | The arrow points toward the named place. | 85 |
| D9-2 | A hospital is nearby. | 85 |
| D5-1 | A rest area is ahead. | 85 |
| W20-1 | Road work is ahead. | 70 |
