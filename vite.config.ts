import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cjsInterop } from "vite-plugin-cjs-interop";
import path from "path";

export default defineConfig(() => {
  const isProduction = process.env.NODE_ENV === "production";
  const noExternal = [
    /^@orderly.*$/,
    "@uiw/react-split",
    "@privy-io/react-auth",
  ];
  if (isProduction) {
    noExternal.push("ethers");
  }

  return {
    ssr: {
      noExternal,
      external: ["@privy-io/cross-app-connect/rainbow-kit"],
    },
    define: {
      'process.env': {},
      'global': 'globalThis',
      // Define Buffer globally for browser
      'Buffer': ['buffer', 'Buffer'],
    },
    resolve: {
      alias: {
        // Point to the actual buffer package
        buffer: path.resolve(__dirname, 'node_modules/buffer/'),
      },
    },
    optimizeDeps: {
      include: ['buffer'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        // Inject Buffer polyfill at build time
        inject: [path.resolve(__dirname, 'polyfills.js')],
      },
    },
    plugins: [
      remix({
        ssr: false,
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
      cjsInterop({
        dependencies: ["bs58", "@coral-xyz/anchor", "lodash"],
      }),
    ],
  };
});
