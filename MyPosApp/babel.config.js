module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel", // <--- এটি অবশ্যই presets এর ভেতর থাকবে
        ],
        plugins: [
            "react-native-reanimated/plugin", // <--- এটি plugins এর ভেতর থাকবে
        ],
    };
};