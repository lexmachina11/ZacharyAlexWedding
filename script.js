const GALLERY_URL = "gallery.json";

const categories = [
    {
        name: "Getting Ready",
        id: "getting-ready"
    },
    {
        name: "Ceremony",
        id: "ceremony"
    },
    {
        name: "Reception",
        id: "reception"
    },
    {
        name: "Videos",
        id: "videos"
    }
];

const galleryContainer = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightbox-content");
const lightboxClose = document.getElementById("lightbox-close");

let lastFocusedElement = null;

/**
 * Load all gallery data from gallery.json.
 */
async function loadGallery() {
    try {
        const response = await fetch(GALLERY_URL);

        if (!response.ok) {
            throw new Error(
                `Could not load gallery.json: ${response.status}`
            );
        }

        const items = await response.json();

        renderGallery(items);
    } catch (error) {
        console.error(error);

        galleryContainer.innerHTML = "";

        const errorMessage = document.createElement("p");
        errorMessage.className = "gallery-status";
        errorMessage.textContent =
            "The gallery could not be loaded. Please try again later.";

        galleryContainer.appendChild(errorMessage);
    }
}

/**
 * Render one section for each defined category.
 */
function renderGallery(items) {
    galleryContainer.innerHTML = "";

    categories.forEach((category) => {
        const categoryItems = items.filter(
            (item) => item.category === category.name
        );

        const section = document.createElement("section");
        section.className = "gallery-section";
        section.id = category.id;

        const heading = document.createElement("div");
        heading.className = "gallery-heading";

        const title = document.createElement("h2");
        title.textContent = category.name;

        const count = document.createElement("span");
        count.className = "gallery-count";

        const itemLabel =
            category.name === "Videos" ? "films" : "photos";

        count.textContent =
            `${categoryItems.length} ${itemLabel}`;

        heading.appendChild(title);
        heading.appendChild(count);

        const grid = document.createElement("div");
        grid.className = "gallery-grid";

        categoryItems.forEach((item, index) => {
            const element = createGalleryItem(
                item,
                category.name,
                index
            );

            grid.appendChild(element);
        });

        section.appendChild(heading);
        section.appendChild(grid);

        galleryContainer.appendChild(section);
    });
}

/**
 * Create either an image or video gallery item.
 */
function createGalleryItem(item, categoryName, index) {
    if (categoryName === "Videos") {
        return createVideoItem(item, index);
    }

    return createImageItem(item, categoryName, index);
}

/**
 * Create a lazily-loaded image item.
 */
function createImageItem(item, categoryName, index) {
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.type = "button";

    button.setAttribute(
        "aria-label",
        `Open ${categoryName} photo ${index + 1}`
    );

    const image = document.createElement("img");

    image.src = item.url;
    image.alt = `${categoryName} wedding photo ${index + 1}`;

    /*
     * Native browser lazy loading.
     */
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("load", () => {
        image.classList.add("is-loaded");
    });

    /*
     * A cached image may already be complete before the
     * load listener executes.
     */
    if (image.complete) {
        image.classList.add("is-loaded");
    }

    button.appendChild(image);

    button.addEventListener("click", () => {
        openImageLightbox(
            item.url,
            image.alt,
            button
        );
    });

    return button;
}

/**
 * Create a video thumbnail.
 *
 * The muted video itself acts as its thumbnail. It does
 * not play inside the gallery grid.
 */
function createVideoItem(item, index) {
    const button = document.createElement("button");
    button.className = "gallery-item video-item";
    button.type = "button";

    button.setAttribute(
        "aria-label",
        `Open wedding video ${index + 1}`
    );

    const video = document.createElement("video");

    video.className = "video-thumbnail";
    video.src = item.url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    /*
     * Move slightly into the video when possible so the
     * browser can display a useful frame as the thumbnail.
     */
    video.addEventListener(
        "loadedmetadata",
        () => {
            if (
                Number.isFinite(video.duration) &&
                video.duration > 0.1
            ) {
                video.currentTime = 0.1;
            }
        },
        {
            once: true
        }
    );

    const playBadge = document.createElement("span");
    playBadge.className = "video-play-badge";
    playBadge.setAttribute("aria-hidden", "true");
    playBadge.textContent = "▶";

    button.appendChild(video);
    button.appendChild(playBadge);

    button.addEventListener("click", () => {
        openVideoLightbox(item.url, button);
    });

    return button;
}

/**
 * Open an image in the full-screen viewer.
 */
function openImageLightbox(url, alt, triggerElement) {
    lastFocusedElement = triggerElement;

    lightboxContent.innerHTML = "";

    const image = document.createElement("img");

    image.src = url;
    image.alt = alt;

    lightboxContent.appendChild(image);

    showLightbox();
}

/**
 * Open a video in the full-screen viewer.
 *
 * Autoplay is deliberately disabled. The user sees the
 * enlarged video thumbnail and chooses when to press play
 * using the native video controls.
 */
function openVideoLightbox(url, triggerElement) {
    lastFocusedElement = triggerElement;

    lightboxContent.innerHTML = "";

    const video = document.createElement("video");

    video.src = url;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";

    lightboxContent.appendChild(video);

    showLightbox();
}

/**
 * Display the overlay.
 */
function showLightbox() {
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("lightbox-open");

    lightboxClose.focus();
}

/**
 * Close the overlay and stop any currently playing video.
 */
function closeLightbox() {
    const openVideo = lightboxContent.querySelector("video");

    if (openVideo) {
        openVideo.pause();
        openVideo.removeAttribute("src");
        openVideo.load();
    }

    lightboxContent.innerHTML = "";

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("lightbox-open");

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

/**
 * Close with the close button.
 */
lightboxClose.addEventListener("click", closeLightbox);

/**
 * Close when clicking the dark background outside the media.
 */
lightbox.addEventListener("click", (event) => {
    if (
        event.target === lightbox ||
        event.target === lightboxContent
    ) {
        closeLightbox();
    }
});

/**
 * Keyboard support.
 */
document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        lightbox.classList.contains("is-open")
    ) {
        closeLightbox();
    }
});

/**
 * Begin loading the JSON gallery.
 */
loadGallery();