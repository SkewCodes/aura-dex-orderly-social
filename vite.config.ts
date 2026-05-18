import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cjsInterop } from "vite-plugin-cjs-interop";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

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
    },
    resolve: {
      alias: {
        buffer: path.resolve(__dirname, 'node_modules/buffer/'),
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
      },
    },
    optimizeDeps: {
      include: ['buffer', 'crypto-browserify', 'stream-browserify'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        inject: [path.resolve(__dirname, 'polyfills.js')],
      },
    },
    build: {
      rollupOptions: {
        plugins: [],
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    plugins: [
      nodePolyfills({
        include: ['buffer', 'crypto', 'stream', 'util', 'process'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
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
