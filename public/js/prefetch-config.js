try {
    const stored = localStorage.getItem("__OFFICE_FOOTBALL_TEAM_v1__");
    // Theme preference is independent of team state; check the legacy key too.
    const themeStored = localStorage.getItem("__LOOM_FB_THEME_v1__");
    if (themeStored) {
        const theme = JSON.parse(themeStored).theme;
        if (theme && theme !== "system") {
            document.documentElement.setAttribute("data-theme", theme);
        }
    }
    void stored;
} catch (err) {
    console.log(err);
}
