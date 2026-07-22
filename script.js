const timeInput = document.querySelector("#time");
const stopSelect = document.querySelector("#stop");
const showBtn = document.querySelector("#showBtn");
const output = document.querySelector("#output");

const calculateArrival = (currentMinute, schedule) => {
    const times = [...schedule];

    for (const stopMinute of times) {
        if (currentMinute <= stopMinute) {
            return {
                wait: stopMinute - currentMinute,
                arrival: stopMinute
            };
        }
    }

    return {
        wait: 60 - currentMinute + times[0],
        arrival: times[0]
    };
};

const displayResult = (result, callback) => {
    callback(result);
};

const loadSchedule = async () => {
    const response = await fetch("schedule.json");
    return await response.json();
};

const formatTime = (hour, minute) => {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const showArrival = async () => {

    const time = timeInput.value;
    const stop = stopSelect.value;

    if (!time || !stop) {
        output.innerHTML = `
            <h2>Arrival Information</h2>
            <p>Please select both time and bus stop.</p>
        `;
        return;
    }

    const [hour, minute] = time.split(":").map(Number);

    const currentMinutes = hour * 60 + minute;
    const startMinutes = 8 * 60;
    const endMinutes = 22 * 60;

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        output.innerHTML = `
            <h2>Arrival Information</h2>
            <p>Buses are not operating at the selected time.</p>
        `;
        return;
    }

    localStorage.setItem("time", time);
    localStorage.setItem("stop", stop);

    const scheduleData = await loadSchedule();

    const stopData = { ...scheduleData[stop] };

    const { towardsTown, towardsRioni } = stopData;

    const town = calculateArrival(minute, towardsTown);
    const rioni = calculateArrival(minute, towardsRioni);

    let townHour = hour;
    let rioniHour = hour;

    if (town.arrival < minute) {
        townHour++;
    }

    if (rioni.arrival < minute) {
        rioniHour++;
    }

    if (townHour === 24) {
        townHour = 0;
    }

    if (rioniHour === 24) {
        rioniHour = 0;
    }

    const result = {
        townN3: town.wait,
        townN25: town.wait,
        rioniN3: rioni.wait,
        rioniN25: rioni.wait,
        townTime: formatTime(townHour, town.arrival),
        rioniTime: formatTime(rioniHour, rioni.arrival)
    };

    displayResult(result, (data) => {

        output.innerHTML = `
            <h2>Arrival Information</h2>

            <div class="direction">
                <h3>Direction: Town</h3>

                <div class="bus">
                    <h4>Bus N3</h4>
                    <p>Scheduled arrival: ${data.townTime}</p>
                    <p>Arrives in ${data.townN3} minute${data.townN3 !== 1 ? "s" : ""}</p>
                </div>

                <div class="bus">
                    <h4>Bus N25</h4>
                    <p>Scheduled arrival: ${data.townTime}</p>
                    <p>Arrives in ${data.townN25} minute${data.townN25 !== 1 ? "s" : ""}</p>
                </div>
            </div>

            <div class="direction">
                <h3>Direction: Rioni Station / Dorms</h3>

                <div class="bus">
                    <h4>Bus N3</h4>
                    <p>Scheduled arrival: ${data.rioniTime}</p>
                    <p>Arrives in ${data.rioniN3} minute${data.rioniN3 !== 1 ? "s" : ""}</p>
                </div>

                <div class="bus">
                    <h4>Bus N25</h4>
                    <p>Scheduled arrival: ${data.rioniTime}</p>
                    <p>Arrives in ${data.rioniN25} minute${data.rioniN25 !== 1 ? "s" : ""}</p>
                </div>
            </div>
        `;
    });

};

const savedTime = localStorage.getItem("time");
const savedStop = localStorage.getItem("stop");

if (savedTime) {
    timeInput.value = savedTime;
}

if (savedStop) {
    stopSelect.value = savedStop;
}

showBtn.addEventListener("click", showArrival);
