
// Find the slider elements.
const sliderTracks = document.querySelectorAll(".slider-track");

sliderTracks.forEach(function(sliderTrack) {

    const slider = sliderTrack.querySelector('input[type="range"]');
    const sliderFill = sliderTrack.querySelector(".slider-fill");

    let activePointerId = null;

    // Update the visual fill to match the slider's value.
    function updateSliderFill() {
        const min = Number(slider.min);
        const max = Number(slider.max);
        const value = Number(slider.value);

        const percentage = ((value - min) / (max - min)) * 100;

        sliderFill.style.width = percentage + "%";
    }

    // Convert a pointer's horizontal position into a slider value.
    function updateSliderFromPointer(event) {
        const rect = sliderTrack.getBoundingClientRect();

        const thumbSize = 20;
        const usableWidth = rect.width - thumbSize;

        const position = event.clientX - rect.left - thumbSize / 2;

        const percentage = Math.max(0, Math.min(1, position / usableWidth));

        const min = Number(slider.min);
        const max = Number(slider.max);
        const step = Number(slider.step) || 1;

        const rawValue = min + percentage * (max - min);

        // Snap to the nearest permitted slider value.
        const newValue = min + Math.round((rawValue - min) / step) * step;

        slider.value = Math.max(min, Math.min(max, newValue));

        // Notify the rest of the application.
        slider.dispatchEvent(new Event("input", { bubbles: true }));

        updateSliderFill();
    }

    // Start interacting with the slider.
    sliderTrack.addEventListener("pointerdown", function(event) {

        if (event.pointerType === "mouse" && event.button !== 0) return;

        activePointerId = event.pointerId;

        sliderTrack.setPointerCapture(event.pointerId);
        sliderTrack.classList.add("is-active");

        slider.focus({ preventScroll: true });

        updateSliderFromPointer(event);

        event.preventDefault();
    });

    // Follow the pointer while it moves.
    sliderTrack.addEventListener("pointermove", function(event) {

        if (event.pointerId !== activePointerId) return;

        updateSliderFromPointer(event);
    });

    // Finish the interaction.
    sliderTrack.addEventListener("pointerup", function(event) {

        if (event.pointerId !== activePointerId) return;

        updateSliderFromPointer(event);

        sliderTrack.classList.remove("is-active");
        activePointerId = null;

        slider.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Handle interrupted interactions.
    sliderTrack.addEventListener("pointercancel", function(event) {

        if (event.pointerId !== activePointerId) return;

        sliderTrack.classList.remove("is-active");
        activePointerId = null;
    });

    // Also update the fill when the slider changes through keyboard input.
    slider.addEventListener("input", updateSliderFill);

    // Set the correct initial fill.
    updateSliderFill();

});
