/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export declare namespace Donate {
  export type OrganizationDataStruct = {
    sender: PromiseOrValue<string>;
    fullAmmount: PromiseOrValue<BigNumberish>;
    netAmmount: PromiseOrValue<BigNumberish>;
    projectId: PromiseOrValue<BigNumberish>;
  };

  export type OrganizationDataStructOutput = [
    string,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    sender: string;
    fullAmmount: BigNumber;
    netAmmount: BigNumber;
    projectId: BigNumber;
  };

  export type IndividualDataStruct = {
    ammount: PromiseOrValue<BigNumberish>;
    projectId: PromiseOrValue<BigNumberish>;
  };

  export type IndividualDataStructOutput = [BigNumber, BigNumber] & {
    ammount: BigNumber;
    projectId: BigNumber;
  };
}

export interface DonateInterface extends utils.Interface {
  functions: {
    "addTokens(address)": FunctionFragment;
    "changeFee(uint256)": FunctionFragment;
    "donate(int256,address,uint256,uint256)": FunctionFragment;
    "getFee()": FunctionFragment;
    "getRecievedDonations(address)": FunctionFragment;
    "getSentDonations(address)": FunctionFragment;
    "getToken(uint256)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "tokenInts(uint256)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addTokens"
      | "changeFee"
      | "donate"
      | "getFee"
      | "getRecievedDonations"
      | "getSentDonations"
      | "getToken"
      | "owner"
      | "renounceOwnership"
      | "tokenInts"
      | "transferOwnership"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addTokens",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "changeFee",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "donate",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "getFee", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getRecievedDonations",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getSentDonations",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getToken",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokenInts",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "addTokens", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "changeFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "donate", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRecievedDonations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSentDonations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenInts", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "Donation(uint256,uint256,address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Donation"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export interface DonationEventObject {
  feeAmmount: BigNumber;
  donationAmmount: BigNumber;
  recieverOrg: string;
}
export type DonationEvent = TypedEvent<
  [BigNumber, BigNumber, string],
  DonationEventObject
>;

export type DonationEventFilter = TypedEventFilter<DonationEvent>;

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface Donate extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DonateInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addTokens(
      newToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeFee(
      newFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    donate(
      _projectId: PromiseOrValue<BigNumberish>,
      _targetAddress: PromiseOrValue<string>,
      _ammount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    getRecievedDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[Donate.OrganizationDataStructOutput[]]>;

    getSentDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[Donate.IndividualDataStructOutput[]]>;

    getToken(
      tokenIndex: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    tokenInts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addTokens(
    newToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeFee(
    newFee: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  donate(
    _projectId: PromiseOrValue<BigNumberish>,
    _targetAddress: PromiseOrValue<string>,
    _ammount: PromiseOrValue<BigNumberish>,
    _token: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getFee(overrides?: CallOverrides): Promise<BigNumber>;

  getRecievedDonations(
    _targetAddress: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<Donate.OrganizationDataStructOutput[]>;

  getSentDonations(
    _targetAddress: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<Donate.IndividualDataStructOutput[]>;

  getToken(
    tokenIndex: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  tokenInts(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addTokens(
      newToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    changeFee(
      newFee: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    donate(
      _projectId: PromiseOrValue<BigNumberish>,
      _targetAddress: PromiseOrValue<string>,
      _ammount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getFee(overrides?: CallOverrides): Promise<BigNumber>;

    getRecievedDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<Donate.OrganizationDataStructOutput[]>;

    getSentDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<Donate.IndividualDataStructOutput[]>;

    getToken(
      tokenIndex: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    tokenInts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Donation(uint256,uint256,address)"(
      feeAmmount?: null,
      donationAmmount?: null,
      recieverOrg?: null
    ): DonationEventFilter;
    Donation(
      feeAmmount?: null,
      donationAmmount?: null,
      recieverOrg?: null
    ): DonationEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    addTokens(
      newToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeFee(
      newFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    donate(
      _projectId: PromiseOrValue<BigNumberish>,
      _targetAddress: PromiseOrValue<string>,
      _ammount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getFee(overrides?: CallOverrides): Promise<BigNumber>;

    getRecievedDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSentDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getToken(
      tokenIndex: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    tokenInts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addTokens(
      newToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeFee(
      newFee: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    donate(
      _projectId: PromiseOrValue<BigNumberish>,
      _targetAddress: PromiseOrValue<string>,
      _ammount: PromiseOrValue<BigNumberish>,
      _token: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRecievedDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSentDonations(
      _targetAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getToken(
      tokenIndex: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    tokenInts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
