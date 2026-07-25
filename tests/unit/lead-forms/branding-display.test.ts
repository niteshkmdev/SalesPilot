import { describe, expect, it } from "vitest";
import { resolveFormBrandingDisplay } from "@/modules/lead-forms/services/form-branding-display";

describe("resolveFormBrandingDisplay", () => {
  it("keeps LOGO and BOTH when org has a logo", () => {
    expect(resolveFormBrandingDisplay("LOGO", true)).toBe("LOGO");
    expect(resolveFormBrandingDisplay("BOTH", true)).toBe("BOTH");
    expect(resolveFormBrandingDisplay("NAME", true)).toBe("NAME");
  });

  it("forces NAME when org has no logo", () => {
    expect(resolveFormBrandingDisplay("LOGO", false)).toBe("NAME");
    expect(resolveFormBrandingDisplay("BOTH", false)).toBe("NAME");
    expect(resolveFormBrandingDisplay("NAME", false)).toBe("NAME");
  });

  it("defaults undefined to BOTH when logo exists, else NAME", () => {
    expect(resolveFormBrandingDisplay(undefined, true)).toBe("BOTH");
    expect(resolveFormBrandingDisplay(undefined, false)).toBe("NAME");
  });
});
