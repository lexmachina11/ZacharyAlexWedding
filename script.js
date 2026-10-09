
const GALLERY_URL = "gallery.json";

const categories = [
    {
        name: "BrideGettingReady",
        title: "Bride Getting Ready",
        id: "bride-getting-ready"
    },
    {
        name: "GroomGettingReady",
        title: "Groom Getting Ready & Portraits",
        id: "groom-getting-ready"
    },
    {
        name: "Ceremony",
        title: "Ceremony",
        id: "ceremony"
    },
    {
        name: "FamilyPortraits",
        title: "Family Portraits",
        id: "family-portraits"
    },
    {
        name: "CoktailHour",
        title: "Coktail Hour",
        id: "cocktail-hour"
    },
    {
        name: "CouplePortraits",
        title: "Bride & Groom Portraits",
        id: "couple-portraits"
    },
    {
        name: "Reception",
        title: "Reception",
        id: "reception"
    },
    {
        name: "Videos",
        title: "Videos",
        id: "videos"
    }
];

const galleryContainer = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightbox-content");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxDownload = document.getElementById("lightbox-download");

let lastFocusedElement = null;
let currentDownload = null;

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

        errorMessage.className = `
            m-0
            py-28
            text-center
            text-[0.8rem]
            text-[#777]
        `;

        errorMessage.textContent =
            "The gallery could not be loaded. Please try again later.";

        galleryContainer.appendChild(errorMessage);
    }
}

function renderGallery(items) {
    galleryContainer.innerHTML = "";

    categories.forEach((category) => {
        const categoryItems = items.filter(
            (item) => item.category === category.name
        );

        const section = document.createElement("section");

        section.id = category.id;

        section.className = `
            mx-auto
            scroll-mt-20
            pt-18
            min-[601px]:pt-[clamp(5rem,8vw,8rem)]
            min-[1200px]:max-w-[1500px]
        `;

        const heading = document.createElement("div");

        heading.className = `
            mb-11
            flex
            flex-col
            items-center
            justify-center
            gap-[0.8rem]
            text-center
            min-[601px]:mb-[clamp(3rem,5vw,5rem)]
        `;

        const title = document.createElement("h2");

        title.className = `
            m-0
            text-[1.45rem]
            leading-[1.2]
            font-semibold
            tracking-[0.005em]
            text-[#222]
            min-[601px]:text-[clamp(1.5rem,2.4vw,2.1rem)]
        `;

        title.textContent = category.title;

        heading.appendChild(title);

        const grid = document.createElement("div");

        grid.className = `
            grid
            grid-cols-2
            gap-[2px]
            min-[601px]:grid-cols-3
            min-[901px]:grid-cols-4
        `;

        section.appendChild(heading);
        section.appendChild(grid);

        renderMasonryItems(
            grid,
            categoryItems,
            category.name
        );

        galleryContainer.appendChild(section);
    });
}

function renderMasonryItems(
    container,
    items,
    categoryName
) {
    function getColumnCount() {
        if (window.innerWidth >= 901) {
            return 4;
        }

        if (window.innerWidth >= 601) {
            return 3;
        }

        return 2;
    }

    function render() {
        const columnCount = getColumnCount();

        container.innerHTML = "";

        const columns = [];

        for (let i = 0; i < columnCount; i += 1) {
            const column = document.createElement("div");

            column.className = `
                flex
                min-w-0
                flex-col
                gap-[2px]
            `;

            columns.push(column);
            container.appendChild(column);
        }

        items.forEach((item, index) => {
            const element = createGalleryItem(
                item,
                categoryName,
                index
            );

            const columnIndex = index % columnCount;

            columns[columnIndex].appendChild(element);
        });
    }

    render();

    let previousColumnCount = getColumnCount();

    window.addEventListener("resize", () => {
        const columnCount = getColumnCount();

        if (columnCount === previousColumnCount) {
            return;
        }

        previousColumnCount = columnCount;
        render();
    });
}

function createGalleryItem(item, categoryName, index) {
    if (categoryName === "Videos") {
        return createVideoItem(item, index);
    }

    return createImageItem(item, categoryName, index);
}

function getGalleryItemClasses() {
    return `
        group
        relative
        block
        w-full
        cursor-zoom-in
        overflow-hidden
        rounded-none
        border-0
        bg-[#ededed]
        p-0
    `;
}

function getImageClasses() {
    return `
        block
        h-auto
        w-full
        max-w-full
        transition-[transform,opacity]
        duration-500
        ease-[cubic-bezier(0.2,0.6,0.2,1)]
        group-hover:scale-[1.018]
        motion-reduce:transition-none
    `;
}

function getMediaClasses() {
    return `
        block
        h-full
        w-full
        max-w-full
        object-cover
        transition-[transform,opacity]
        duration-500
        ease-[cubic-bezier(0.2,0.6,0.2,1)]
        group-hover:scale-[1.018]
        motion-reduce:transition-none
    `;
}

function createImageItem(item, categoryName, index) {
    const button = document.createElement("button");

    button.className = getGalleryItemClasses();
    button.type = "button";

    button.setAttribute(
        "aria-label",
        `Open ${categoryName} photo ${index + 1}`
    );

    const image = document.createElement("img");

    image.src = item.webUrl;
    image.alt = `${categoryName} wedding photo ${index + 1}`;
    image.loading = "lazy";
    image.decoding = "async";

    image.className = `
        ${getImageClasses()}
        opacity-0
    `;

    image.addEventListener("load", () => {
        image.classList.remove("opacity-0");
        image.classList.add("opacity-100");
    });

    if (image.complete) {
        image.classList.remove("opacity-0");
        image.classList.add("opacity-100");
    }

    button.appendChild(image);

    button.addEventListener("click", () => {
        openImageLightbox(item, image.alt, button);
    });

    return button;
}

function createVideoItem(item, index) {
    const button = document.createElement("button");

    button.className = `
        ${getGalleryItemClasses()}
        cursor-pointer
    `;

    button.type = "button";

    button.setAttribute(
        "aria-label",
        `Open wedding video ${index + 1}`
    );

    const video = document.createElement("video");

    video.className = `
        pointer-events-none
        block
        h-auto
        w-full
        max-w-full
        transition-transform
        duration-500
        ease-[cubic-bezier(0.2,0.6,0.2,1)]
        group-hover:scale-[1.018]
        motion-reduce:transition-none
    `;

    video.src = item.webUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.addEventListener(
        "loadedmetadata",
        () => {
            if (video.videoWidth && video.videoHeight) {
                button.style.aspectRatio =
                    `${video.videoWidth} / ${video.videoHeight}`;
            }

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

    playBadge.className = `
        pointer-events-none
        absolute
        top-1/2
        left-1/2
        grid
        size-[46px]
        -translate-x-1/2
        -translate-y-1/2
        place-items-center
        rounded-full
        border
        border-white/80
        bg-black/20
        pl-[3px]
        text-[0.72rem]
        text-white
        backdrop-blur-[5px]
        transition-[background-color,scale]
        duration-200
        group-hover:scale-[1.06]
        group-hover:bg-black/40
        motion-reduce:transition-none
        min-[601px]:size-[58px]
        min-[601px]:text-[0.9rem]
    `;

    playBadge.setAttribute("aria-hidden", "true");
    playBadge.textContent = "▶";

    button.appendChild(video);
    button.appendChild(playBadge);

    button.addEventListener("click", () => {
        openVideoLightbox(item, button);
    });

    return button;
}

function openImageLightbox(item, alt, triggerElement) {
    lastFocusedElement = triggerElement;
    setLightboxDownload(item.downloadUrl, "image");

    lightboxContent.innerHTML = "";

    const image = document.createElement("img");

    image.src = item.webUrl;
    image.alt = alt;

    image.className = `
        block
        h-auto
        max-h-full
        w-auto
        max-w-full
        object-contain
    `;

    lightboxContent.appendChild(image);

    showLightbox();
}

function openVideoLightbox(item, triggerElement) {
    lastFocusedElement = triggerElement;
    setLightboxDownload(item.downloadUrl, "video");

    lightboxContent.innerHTML = "";

    const video = document.createElement("video");

    video.src = item.webUrl;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.className = `
        block
        h-auto
        max-h-full
        w-full
        max-w-[1200px]
        object-contain
    `;

    lightboxContent.appendChild(video);

    showLightbox();
}

function setLightboxDownload(url, mediaType) {
    currentDownload = url ? { url, mediaType } : null;
    lightboxDownload.disabled = !currentDownload;
}

function getDownloadFilename(url, mediaType, mimeType) {
    const parsedUrl = new URL(url, document.baseURI);
    const lastSegment = decodeURIComponent(
        parsedUrl.pathname.split("/").pop() || ""
    );
    const basename = lastSegment.replace(/[^a-zA-Z0-9._-]/g, "_") ||
        (mediaType === "video" ? "wedding-video" : "wedding-photo");

    if (/\.[a-zA-Z0-9]{2,5}$/.test(basename)) {
        return basename;
    }

    const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
        "image/gif": "gif",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/quicktime": "mov"
    };
    const format = parsedUrl.searchParams.get("fm");
    const extension = extensions[mimeType] ||
        (format && /^[a-zA-Z0-9]{2,5}$/.test(format) ? format : null) ||
        (mediaType === "video" ? "mp4" : "jpg");

    return `${basename}.${extension}`;
}

async function downloadLightboxMedia() {
    if (!currentDownload) {
        return;
    }

    const { url, mediaType } = currentDownload;
    lightboxDownload.disabled = true;
    lightboxDownload.setAttribute("aria-busy", "true");

    try {
        // A Blob URL allows downloads from image hosts that permit CORS.
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Download request failed: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = blobUrl;
        link.download = getDownloadFilename(url, mediaType, blob.type);
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Give the browser time to begin the download before releasing the URL.
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
        console.error("Could not download gallery media:", error);
        window.alert(
            "The file could not be downloaded. The media host may be blocking " +
            "downloads from this website."
        );
    } finally {
        lightboxDownload.removeAttribute("aria-busy");
        lightboxDownload.disabled = !currentDownload;
    }
}

function showLightbox() {
    lightbox.classList.remove("hidden");
    lightbox.classList.add("flex");

    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("overflow-hidden");

    lightboxClose.focus();
}

function closeLightbox() {
    const openVideo = lightboxContent.querySelector("video");

    if (openVideo) {
        openVideo.pause();
        openVideo.removeAttribute("src");
        openVideo.load();
    }

    lightboxContent.innerHTML = "";
    currentDownload = null;
    lightboxDownload.disabled = true;

    lightbox.classList.remove("flex");
    lightbox.classList.add("hidden");

    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("overflow-hidden");

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

lightboxClose.addEventListener("click", closeLightbox);
lightboxDownload.addEventListener("click", downloadLightboxMedia);

lightbox.addEventListener("click", (event) => {
    if (
        event.target === lightbox ||
        event.target === lightboxContent
    ) {
        closeLightbox();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        !lightbox.classList.contains("hidden")
    ) {
        closeLightbox();
    }
});

loadGallery();