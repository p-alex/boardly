import { Mock, Mocked, vi } from "vitest";
import {
  PwnedPasswordCheckerService,
  PwnedPasswordCheckerServiceImpl,
} from "./PwnedPasswordCheckerService";
import { pwnedPasswordsResponseDtoSchema } from "../../../../infrastructure/dtos/pwnedPasswordsResponseDto.schema";
import { CryptoUtil } from "@boardly/shared/utils";
import axios from "axios";

const data = "SUFIX:3\r\nHELLO:2\r\nWORLD:1";

let axiosGetSpy: ReturnType<typeof vi.spyOn>;

describe("PwnedPasswordCheckerService.ts (unit)", () => {
  let pwnedPasswordCheckerService: PwnedPasswordCheckerService;

  let mockResponseSchema: Mocked<typeof pwnedPasswordsResponseDtoSchema>;
  let mockCryptoUtil: Mocked<CryptoUtil>;

  const prefix = "aaaaa";
  const hash = prefix + "SUFIX";

  beforeEach(() => {
    axiosGetSpy = vi.spyOn(axios, "get").mockResolvedValue({ data });

    mockResponseSchema = {
      safeParse: vi.fn().mockReturnValue({
        success: true,
        data,
      }),
    } as unknown as Mocked<typeof pwnedPasswordsResponseDtoSchema>;

    mockCryptoUtil = {
      sha1: vi.fn().mockReturnValue(hash),
    } as unknown as Mocked<CryptoUtil>;

    pwnedPasswordCheckerService = new PwnedPasswordCheckerServiceImpl(
      mockResponseSchema,
      mockCryptoUtil,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hashes the password using SHA1", async () => {
    await pwnedPasswordCheckerService.execute({ password: "string" });
    expect(mockCryptoUtil.sha1).toHaveBeenCalledWith("string");
  });

  it("calls Pwned API with SHA1 prefix", async () => {
    await pwnedPasswordCheckerService.execute({ password: "string" });
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.pwnedpasswords.com/range/" + prefix.toUpperCase(),
    );
  });

  it("throws error if the request response validation fails", async () => {
    (mockResponseSchema.safeParse as Mock).mockReturnValue({ success: false });

    await expect(pwnedPasswordCheckerService.execute({ password: "string" })).rejects.toThrow(
      Error,
    );
  });

  it("returns true if the suffix of the initial hash is found in the request's response data object", async () => {
    const result = await pwnedPasswordCheckerService.execute({ password: "string" });

    expect(result).toBe(true);
  });

  it("returns false if the suffix of the initial hash is not found in the request's response data object", async () => {
    const data = "HELLO\r\nWORLD";
    vi.spyOn(axios, "get").mockResolvedValue({ data: data });

    (mockResponseSchema.safeParse as Mock).mockReturnValue({ success: true, data });

    const result = await pwnedPasswordCheckerService.execute({ password: "string" });

    expect(result).toBe(false);
  });
});
