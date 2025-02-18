import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion, Variants } from 'framer-motion';
import useMeasure from 'react-use/lib/useMeasure';
import { H1 } from './typography/Heading';
import { variables, motion as motionConfig } from '../config';
import { Image, ImageType } from './Image/Image';
import { Icon } from './Icon';

const CardWrapper = styled(
    ({ variant, withImage, disablePadding, expanded, expandable, nested, ...rest }) => (
        <motion.div {...rest} />
    ),
)<{
    variant?: CollapsibleCardProps['variant'];
    withImage?: boolean;
    expanded?: CollapsibleCardProps['expanded'];
    expandable?: CollapsibleCardProps['expandable'];
}>`
    position: relative;
    padding: ${({ variant }) => (variant === 'large' ? '40px 80px' : '20px 30px')};
    width: ${({ variant }) => (variant === 'large' ? '100%' : 'auto')};
    border-radius: 16px;
    background: ${({ theme }) => theme.BG_WHITE};
    z-index: ${variables.Z_INDEX.BASE};
    cursor: ${({ expanded }) => !expanded && 'pointer'};

    ${({ expandable, variant }) =>
        !expandable &&
        css`
            ${variables.SCREEN_QUERY.BELOW_LAPTOP} {
                padding-left: ${variant === 'large' ? '40px' : '30px'};
                padding-right: ${variant === 'large' ? '40px' : '30px'};
                padding-bottom: ${variant === 'large' ? '40px' : '20px'};
            }

            ${variables.SCREEN_QUERY.MOBILE} {
                padding-left: 20px;
                padding-right: 20px;
            }
        `}

    ${({ expanded, expandable, theme }) =>
        expandable &&
        !expanded &&
        css`
            background: ${theme.BG_GREY};
            box-shadow: rgba(0, 0, 0, 0) 0px 2px 5px 0px;
            border-radius: 10px;
            padding-top: 16px;
            padding-left: 26px;
            padding-right: 26px;
            padding-bottom: 16px;
        `}

    ${({ expanded, expandable, theme, variant }) =>
        expandable &&
        expanded &&
        css`
            background: ${theme.BG_WHITE};
            border-radius: 16px;
            padding: ${variant === 'large' ? '40px' : '20px 30px'};
        `}

    ${({ nested, theme }) =>
        !nested &&
        css`
            box-shadow: 0 2px 5px 0 ${theme.BOX_SHADOW_BLACK_20};
        `}

    ${({ withImage }) =>
        withImage &&
        css`
            margin-top: 50px;
            padding-top: 80px;
        `}

    ${({ variant }) =>
        variant === 'small' &&
        css`
            max-width: 550px;
        `}
`;

const CardWrapperInner = styled.div<{ expandable: boolean }>`
    overflow: ${({ expandable }) => expandable && 'hidden'};
`;

const Text = styled.span`
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const CardImageWrapper = styled.div`
    width: 100px;
    height: 100px;
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    top: -50px;
    left: 0;
    right: 0;
`;

const ChildrenWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Heading = styled(H1)<{ withDescription?: boolean }>`
    font-size: 28px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-bottom: ${({ withDescription }) => (withDescription ? '16px' : '36px')};
    text-align: center;
`;

const Description = styled.div<{ hasChildren?: boolean }>`
    padding: 0px 60px 36px 60px;
    text-align: center;

    ${variables.SCREEN_QUERY.BELOW_TABLET} {
        padding: 0px 0px 36px 0px;
    }
`;

const CollapsibleCardInner = styled(motion.div)`
    text-align: left;
    display: flex;
    align-items: center;
    padding: 0 6px;
`;

const HeadingExpandable = styled.div`
    color: ${({ theme }) => theme.TYPE_DARK_GREY};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    flex: 1;
`;

const Tag = styled.div`
    color: ${({ theme }) => theme.TYPE_LIGHT_GREY};
    text-transform: uppercase;
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    letter-spacing: 0.2px;
`;

const CloseIcon = styled(Icon)`
    position: absolute;
    top: 24px;
    right: 24px;
    background: transparent;
`;

export interface CollapsibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
    image?: ImageType;
    variant?: 'small' | 'large';
    expandable?: boolean;
    expanded?: boolean;
    nested?: boolean;
    onToggle?: () => void;
    expandableIcon?: React.ReactNode;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    tag?: React.ReactNode;
}

export const CollapsibleCard = ({
    heading,
    description,
    image,
    children,
    className,
    variant = 'large',
    expanded = true,
    expandable = false,
    expandableIcon,
    nested,
    tag,
    onCanPlayThroughCapture,
    onToggle = () => undefined,
    ...rest
}: CollapsibleCardProps) => {
    const [heightRef, { height }] = useMeasure<HTMLDivElement>();

    const headerVariants = useMemo<Variants>(
        () => ({
            closed: {
                opacity: 1,
            },
            expanded: {
                opacity: 0,
            },
        }),
        [],
    );

    const animationVariants = useMemo<Variants>(
        () => ({
            closed: {
                opacity: 0,
                height: 0,
            },
            expanded: {
                opacity: 1,
                height,
            },
        }),
        [height],
    );

    return (
        <CardWrapper
            expanded={expanded}
            expandable={expandable}
            variant={variant}
            withImage={!!image}
            className={className}
            nested={nested}
            animate={expanded ? 'expanded' : 'closed'}
            transition={{ duration: 0.4, ease: motionConfig.motionEasing.transition }}
            onClick={expandable && !expanded ? onToggle : undefined}
            data-test="@components/collapsible-box"
            {...rest}
        >
            <CardWrapperInner expandable={expandable}>
                {expandable && (
                    <CollapsibleCardInner
                        variants={headerVariants}
                        animate={expanded ? 'expanded' : 'closed'}
                        transition={{ duration: 0.2, ease: 'linear' }}
                    >
                        {expandableIcon}

                        <HeadingExpandable>{heading}</HeadingExpandable>

                        {tag && <Tag>{tag}</Tag>}
                    </CollapsibleCardInner>
                )}

                <motion.div
                    variants={expandable ? animationVariants : undefined}
                    animate={expanded ? 'expanded' : 'closed'}
                    transition={{ duration: 0.4, ease: motionConfig.motionEasing.transition }}
                >
                    <div ref={heightRef}>
                        {expandable && expanded && (
                            <CloseIcon icon="CROSS" size={22} onClick={() => onToggle()} />
                        )}

                        {heading && <Heading withDescription={!!description}>{heading}</Heading>}

                        {description && (
                            <Description hasChildren={!!children}>
                                <Text>{description}</Text>
                            </Description>
                        )}

                        {image && (
                            <CardImageWrapper>
                                <Image width={100} height={100} image={image} />
                            </CardImageWrapper>
                        )}

                        <ChildrenWrapper>{children}</ChildrenWrapper>
                    </div>
                </motion.div>
            </CardWrapperInner>
        </CardWrapper>
    );
};
