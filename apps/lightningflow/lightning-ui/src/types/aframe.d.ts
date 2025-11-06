// Type declarations for A-Frame
declare namespace AFRAME {
  interface AScene {
    object3D: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    renderStarted: boolean;
    camera: THREE.Camera;
    canvas: HTMLCanvasElement;
    isMobile: boolean;
    enterVR: () => Promise<void>;
    exitVR: () => Promise<void>;
  }

  interface Entity {
    object3D: THREE.Object3D;
    components: { [key: string]: Component };
    isPlaying: boolean;
    sceneEl: AScene;
    getObject3D: (type: string) => THREE.Object3D;
  }

  interface Component {
    el: Entity;
    data: any;
    schema: any;
    init: () => void;
    update: (oldData: any) => void;
    remove: () => void;
    tick: (time: number, timeDelta: number) => void;
  }

  interface System {
    data: any;
    schema: any;
    init: () => void;
    tick: (time: number, timeDelta: number) => void;
  }

  function registerComponent(name: string, component: Component): void;
  function registerSystem(name: string, system: System): void;
  function registerShader(name: string, shader: any): void;
  function registerGeometry(name: string, geometry: any): void;
  function registerPrimitive(name: string, primitive: any): void;

  const scenes: AScene[];
  const components: { [key: string]: Component };
  const systems: { [key: string]: System };
}

// Globally declare AFRAME in the window object
declare interface Window {
  AFRAME: typeof AFRAME;
} 