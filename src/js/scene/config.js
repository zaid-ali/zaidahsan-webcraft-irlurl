// @ts-check

/** @type {{ id: string, position: [number, number, number], rotation: [number, number, number], color: string }[]} */
export const CAMERA_STOPS = [
  {
    id: "intro",
    position: [-2.901403954521939, 39.06439183301569, -6.880641548011514],
    rotation: [-2.5052311120241, -0.7184463954784623, -2.6889179948342017],
    color: "#818189",
  },
  {
    id: "work",
    position: [-55.71897435046533, -5.4012492995303205, 42.80524468118615],
    rotation: [0.5895901866697232, -0.537959483265403, 0.3302158591803081],
    color: "#b19787",
  },
  {
    id: "services",
    position: [35.015547724609014, -20.419550146256586, 64.42880348267002],
    rotation: [-0.3498437299454991, 0.842944649557812, 0.26594741806483047],
    color: "#1b1b1b",
  },
  {
    id: "about",
    position: [22.80307573716708, 62.77160606146128, -28.927427894001493],
    rotation: [-2.0306963586682647, 0.5879392656646073, 2.2997546648348366],
    color: "#c87a49",
  },
  {
    id: "mission",
    position: [-19.432024377585968, 48.64849629499654, -11.288182292337344],
    rotation: [-0.12205325310477481, -0.9613684848499178, -0.10024351308354748],
    color: "#a3b2b7",
  },
  {
    id: "purpose",
    position: [14.68516850161623, 52.33891382562716, 26.79672748090908],
    rotation: [-2.1558529373132664, -0.2791135671033394, -2.747450735368274],
    color: "#c1d91f",
  },
  {
    id: "vision",
    position: [-67.9352760386313, -29.64565498979756, 22.070641004387205],
    rotation: [
      -0.044241178884691666, -0.7536939327974934, -0.030286376455911753,
    ],
    color: "#6b5353",
  },
  {
    id: "team",
    position: [8.886698949333713, -5.682326945105338, -70.03490511004586],
    rotation: [-2.6351450598357795, 0.8628865219623448, 2.742757140564438],
    color: "#595c55",
  },
  {
    id: "outro",
    position: [3.440957040147818, -1.544356611534452, 187.2371608344979],
    rotation: [
      -0.025230360805667987, -0.00026757727134044595, -0.000006752503895754466,
    ],
    color: "#151515",
  },
];

/** @type {[string, [number, number, number], number, string][]} */
export const MODEL_DEFINITIONS = [
  ["L_1_inflated.glb", [40.6, 45, -33], 0, "float"],
  ["L_3_suzanne2.glb", [1.5, 33, -17], 1, "rotate"],
  ["L_4_art cube.glb", [-7, 19.5, -36], 0.7, ""],
  ["L_5_rubicks.glb", [-10, 6, -66], 0, ""],
  ["L_6_Sci-Fi.glb", [-19.5, -6, -23], 0, ""],
  ["L_8_liquid plastic.glb", [-32.5, -33, -27], 0.8, ""],
  ["R_1_liquid metallic.glb", [34, 33, 42], 1, ""],
  ["R_5_inflated.glb", [6.6, -19, 18], 0, "float"],
  ["R_6_Speaker.glb", [2.5, -30.5, 37.4], 0, ""],
  ["R_7_minecraft.glb", [-5.5, -44.5, 56.3], 0, ""],
  ["R_8_concret.glb", [-39.3, -45.7, 2], 0, ""],
  ["R2_Hardware.glb", [16.4, 1.5, -5], 0.8, ""],
];

export const SCENE_COLORS = {
  orange: 0xeb9500,
  teamOrange: 0xe54e01,
  dark: 0x111111,
};

export const INTRO_DISTANCE = 400;

/** @param {number[]} position */
export function introStartPosition(position) {
  const angle = Math.atan2(position[0], position[2]);
  return [
    position[0] + Math.sin(angle) * INTRO_DISTANCE,
    position[1],
    position[2] + Math.cos(angle) * INTRO_DISTANCE,
  ];
}
